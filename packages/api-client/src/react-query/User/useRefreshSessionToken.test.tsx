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

describe('useRefreshSessionToken', () => {
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
