import '@testing-library/jest-dom'
import React, { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRefreshSessionToken } from './useRefreshSessionToken'
import { QueryClientProvider, QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import axios from 'axios'

const mockResponse = {
  result: {
    email: 'jim@sumocreations.com',
    firstName: 'Jim',
    lastName: 'Jeffers',
    roles: ['operator'],
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKaW0iLCJsYXN0TmFtZSI6IkplZmZlcnMiLCJleHAiOjE2NTM3NzgzODYsImVtYWlsIjoiamltQHN1bW9jcmVhdGlvbnMuY29tIiwicm9sZXMiOlsib3BlcmF0b3IiXX0.iIE60rpDVtL56Kt9p_Zs4MFLaDj03ISiJ9TVjr44Q24',
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockLogin: React.FC<{ testToken?: string }> = ({ testToken = '' }) => {
  const [sessionToken, setSessionToken] = useState(testToken)
  const currentSession = useRefreshSessionToken({
    sessionToken,
    setSessionToken,
    instance: axios.create(),
  })
  return currentSession.isLoading ? null : (
    <div data-testid="result">
      {currentSession.data?.firstName ?? 'Not logged in'}
    </div>
  )
}

const MockComponent: React.FC<{
  queryClient: QueryClient
  testToken?: string
}> = ({ queryClient, testToken }) => (
  <QueryClientProvider client={queryClient}>
    <MockLogin testToken={testToken} />
  </QueryClientProvider>
)

const MockTokenHook: React.FC<{
  sessionToken: string
  setSessionToken: (token: string) => void
}> = ({ sessionToken, setSessionToken }) => {
  useRefreshSessionToken({
    sessionToken,
    setSessionToken,
    instance: axios.create(),
  })
  return null
}

describe('useRefreshSessionToken', () => {
  it('should call setSessionToken with the new token when the response includes one', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockResponse))
      )
    )

    const setSessionToken = jest.fn()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MockTokenHook
          sessionToken="old-fake-token"
          setSessionToken={setSessionToken}
        />
      </QueryClientProvider>
    )

    await waitFor(() =>
      expect(setSessionToken).toHaveBeenCalledWith(mockResponse.result.token)
    )
  })

  it('should not call setSessionToken when the response has no token field', async () => {
    // Regression: the real okeanids /user/token endpoint returns 200 with user
    // profile data but omits the token field. Before the fix (onSettled → onSuccess
    // + guard), this caused setSessionToken('') to wipe the cookie.
    server.use(
      rest.get('/user/token', (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({
            result: {
              email: 'jim@sumocreations.com',
              firstName: 'Jim',
              lastName: 'Jeffers',
              roles: ['operator'],
              // token field intentionally absent
            },
          })
        )
      )
    )

    const setSessionToken = jest.fn()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MockTokenHook
          sessionToken="existing-cookie-token"
          setSessionToken={setSessionToken}
        />
      </QueryClientProvider>
    )

    // Allow the query to settle
    await new Promise((r) => setTimeout(r, 100))

    expect(setSessionToken).not.toHaveBeenCalled()
  })

  it('should not call setSessionToken when the token refresh fails', async () => {
    // Regression: onSettled called setSessionToken('') on 401/500, wiping the cookie.
    server.use(
      rest.get('/user/token', (_req, res, ctx) => res(ctx.status(401)))
    )

    const setSessionToken = jest.fn()
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <MockTokenHook
          sessionToken="existing-cookie-token"
          setSessionToken={setSessionToken}
        />
      </QueryClientProvider>
    )

    await new Promise((r) => setTimeout(r, 200))
    expect(setSessionToken).not.toHaveBeenCalledWith('')
  })

  it('should render the logout button and auth token after the user authenticates', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )

    render(
      <MockComponent
        queryClient={new QueryClient()}
        testToken="this-is-a-test"
      />
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result.firstName)
    })

    expect(screen.queryByText(mockResponse.result.firstName)).toHaveTextContent(
      mockResponse.result.firstName
    )
  })

  it('should not render the logout button and auth token if the user is not able to authenticate', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(''))
      })
    )

    render(<MockComponent queryClient={new QueryClient()} />)
    await waitFor(() => {
      return screen.getByText('Not logged in')
    })

    expect(
      screen.queryByText(mockResponse.result.firstName)
    ).not.toBeInTheDocument()
  })
})
