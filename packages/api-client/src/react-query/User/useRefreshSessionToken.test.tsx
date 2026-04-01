import '@testing-library/jest-dom'
import React from 'react'
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

const mockSetSessionToken = jest.fn()

const MockLogin: React.FC<{ testToken?: string }> = ({ testToken = '' }) => {
  const currentSession = useRefreshSessionToken({
    sessionToken: testToken,
    setSessionToken: mockSetSessionToken,
    instance: axios.create(),
  })
  return <div data-testid="status">{currentSession.status}</div>
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
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

  afterEach(() => {
    mockSetSessionToken.mockReset()
  })

  it.each([401, 403])(
    'should clear token for auth failure status %i',
    async (status) => {
      server.use(
        rest.get('/user/token', (_req, res, ctx) => {
          return res(ctx.status(status), ctx.json({}))
        })
      )

      render(
        <MockComponent
          queryClient={createQueryClient()}
          testToken="test-token"
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error')
      })

      expect(mockSetSessionToken).toHaveBeenCalledWith('')
    }
  )

  it('should preserve token for server errors', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res(ctx.status(500), ctx.json({}))
      })
    )

    render(
      <MockComponent queryClient={createQueryClient()} testToken="test-token" />
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error')
    })

    expect(mockSetSessionToken).not.toHaveBeenCalled()
  })

  it('should preserve token for network errors', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res.networkError('Failed to connect')
      })
    )

    render(
      <MockComponent queryClient={createQueryClient()} testToken="test-token" />
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error')
    })

    expect(mockSetSessionToken).not.toHaveBeenCalled()
  })

  it('should clear token when a successful response omits token', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ result: {} }))
      })
    )

    render(
      <MockComponent queryClient={createQueryClient()} testToken="test-token" />
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success')
    })

    expect(mockSetSessionToken).toHaveBeenCalledWith('')
  })

  it('should set refreshed token when a successful response includes token', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )

    render(
      <MockComponent queryClient={createQueryClient()} testToken="test-token" />
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success')
    })

    expect(mockSetSessionToken).toHaveBeenCalledWith(mockResponse.result.token)
  })
})
