import '@testing-library/jest-dom'
import React, { useState } from 'react'
import { TethysApiProvider } from './TethysApiProvider'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useTethysApiContext } from './useTethysApiContext'
import { QueryClientProvider, QueryClient, setLogger } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { mockResponse as infoResponse } from '../../axios/Info/getInfo.test'

setLogger({
  log: console.log,
  warn: console.warn,
  // ✅ no more errors on the console
  error: () => {},
})

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ turns retries off
        retry: false,
      },
    },
  })

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

const server = setupServer(
  rest.post('/user/auth', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/user/token', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(infoResponse))
  })
)

const LoadingAwareContent: React.FC = () => {
  const { authenticated, loading } = useTethysApiContext()
  return (
    <div>
      <div aria-label="loading-state">{loading ? 'loading' : 'idle'}</div>
      <div aria-label="auth-state">
        {authenticated ? 'authenticated' : 'unauthenticated'}
      </div>
    </div>
  )
}

const MockLoadingComponent: React.FC<{
  client: QueryClient
  testToken?: string
  setSessionToken?: (token: string) => void
}> = ({ client, testToken, setSessionToken: externalSetToken }) => {
  const [sessionToken, setSessionToken] = useState(testToken ?? '')
  return (
    <QueryClientProvider client={client}>
      <TethysApiProvider
        sessionToken={sessionToken}
        setSessionToken={externalSetToken ?? setSessionToken}
      >
        <LoadingAwareContent />
      </TethysApiProvider>
    </QueryClientProvider>
  )
}

const AuthContent: React.FC = () => {
  const { authenticated, token, login, logout, error, siteConfig } =
    useTethysApiContext()
  return authenticated ? (
    <>
      <div aria-label="auth-content-token">{token}</div>
      <button
        aria-label="auth-content-logout-button"
        onClick={() => {
          logout()
        }}
      >
        logout
      </button>
    </>
  ) : (
    <>
      <p>{siteConfig?.appConfig?.googleApiKey}</p>
      <button
        aria-label="auth-content-login-button"
        onClick={() => {
          login('test@example.com', 'password')
        }}
      >
        login
      </button>
      {error && <div aria-label="auth-content-error">{error}</div>}
    </>
  )
}

const MockComponent: React.FC<{ client: QueryClient; testToken?: string }> = ({
  client,
  testToken,
}) => {
  const [sessionToken, setSessionToken] = useState(testToken ?? '')
  return (
    <QueryClientProvider client={client}>
      <TethysApiProvider
        sessionToken={sessionToken}
        setSessionToken={setSessionToken}
      >
        <AuthContent />
      </TethysApiProvider>
    </QueryClientProvider>
  )
}

describe('TethysApiProvider', () => {
  beforeAll(() => {
    server.listen()
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should render an attribute from the general site configuration.', async () => {
    const client = makeClient()
    render(<MockComponent client={client} />)
    await waitFor(() =>
      screen.getByText(infoResponse.result.appConfig.googleApiKey)
    )
    expect(
      screen.getByText(infoResponse.result.appConfig.googleApiKey)
    ).toBeInTheDocument()
  })

  it('should render the login button if not authenticated', async () => {
    const client = makeClient()
    render(<MockComponent client={client} />)
    expect(
      screen.getByLabelText(/auth-content-login-button/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-error/i)
    ).not.toBeInTheDocument()
  })

  it('should render the logout button if the user is authenticated via cookie', async () => {
    const client = makeClient()
    render(<MockComponent client={client} testToken="this-is-a-fake-session" />)
    await waitFor(() => screen.getByLabelText('auth-content-token'))
    expect(screen.queryByLabelText(/auth-content-token/i)).toBeInTheDocument()
  })

  it('should not render the authenticated content if not authenticated', async () => {
    const client = makeClient()
    render(<MockComponent client={client} />)
    expect(
      screen.queryByLabelText(/auth-content-token/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).not.toBeInTheDocument()
  })

  it('should render the logout button and auth token after the user authenticates', async () => {
    const client = makeClient()
    render(<MockComponent client={client} />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() => screen.getByLabelText('auth-content-token'))
    expect(screen.queryByLabelText(/auth-content-token/i)).toHaveTextContent(
      mockResponse.result.token
    )
    expect(
      screen.getByLabelText(/auth-content-logout-button/i)
    ).toBeInTheDocument()
  })

  it('should not render the logout button and auth token if the user authentication fails', async () => {
    server.use(
      rest.post('/user/auth', (_req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    const client = makeClient()
    render(<MockComponent client={client} />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() => screen.getByLabelText('auth-content-error'))
    expect(
      screen.queryByLabelText(/auth-content-token/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).not.toBeInTheDocument()
  })

  it('should render an error if the user authentication fails', async () => {
    server.use(
      rest.post('/user/auth', (_req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    const client = makeClient()
    render(<MockComponent client={client} />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() => screen.getByLabelText('auth-content-error'))
    expect(screen.getByLabelText(/auth-content-error/i)).toBeInTheDocument()
  })

  it('should clear an error if the user authenticates successfully after failure', async () => {
    const client = makeClient()
    render(<MockComponent client={client} />)

    server.use(
      rest.post('/user/auth', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => screen.getByLabelText('auth-content-error'))
    expect(screen.getByLabelText(/auth-content-error/i)).toBeInTheDocument()

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => screen.getByLabelText('auth-content-token'))
    expect(
      screen.queryByLabelText(/auth-content-error/i)
    ).not.toBeInTheDocument()
  })

  it('should logout the user if the user clicks the logout button after authenticating', async () => {
    const client = makeClient()
    render(<MockComponent client={client} />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() => screen.getByLabelText('auth-content-logout-button'))
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-login-button/i)
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('logout'))

    await waitFor(() => screen.getByLabelText('auth-content-login-button'))
    expect(
      screen.queryByLabelText(/auth-content-login-button/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).not.toBeInTheDocument()
  })

  describe('browser refresh - /user/token returns no token field', () => {
    // This is the real-world behaviour of the okeanids server: the endpoint
    // returns 200 with user profile data but omits the token field.  The
    // provider must still restore the authenticated state by merging the
    // existing session token (already in the cookie) with the profile data.

    it('should restore authenticated state when the refresh response has no token', async () => {
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

      const client = makeClient()
      render(
        <MockLoadingComponent client={client} testToken="fake-session-token" />
      )

      await waitFor(() => {
        expect(screen.getByLabelText('auth-state')).toHaveTextContent(
          'authenticated'
        )
        expect(screen.getByLabelText('loading-state')).toHaveTextContent('idle')
      })
    })

    it('should not call setSessionToken with an empty string when the refresh response has no token', async () => {
      // Regression: before the fix, onSuccess called setSessionToken(data?.token ?? '')
      // which resolved to setSessionToken('') and wiped the cookie.
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
              },
            })
          )
        )
      )

      const mockSetToken = jest.fn()
      const client = makeClient()
      render(
        <MockLoadingComponent
          client={client}
          testToken="fake-session-token"
          setSessionToken={mockSetToken}
        />
      )

      await waitFor(() =>
        expect(screen.getByLabelText('loading-state')).toHaveTextContent('idle')
      )

      expect(mockSetToken).not.toHaveBeenCalledWith('')
    })
  })

  describe('browser refresh session recovery (pendingAuthValidation)', () => {
    it('should show loading state immediately when a session token exists in the cookie', () => {
      const client = makeClient()
      render(
        <MockLoadingComponent client={client} testToken="fake-session-token" />
      )
      // pendingAuthValidation should be true on the very first render —
      // sessionToken present but currentUser not yet set from the async refresh
      expect(screen.getByLabelText('loading-state')).toHaveTextContent(
        'loading'
      )
    })

    it('should recover to authenticated after a successful token refresh on browser refresh', async () => {
      const client = makeClient()
      render(
        <MockLoadingComponent client={client} testToken="fake-session-token" />
      )

      // Assert both conditions in the same waitFor so they must be true
      // in the same render — avoids a race between onSuccess calling
      // setSessionToken (which can briefly re-trigger a pending render)
      // and the useEffect that sets currentUser.
      await waitFor(() => {
        expect(screen.getByLabelText('auth-state')).toHaveTextContent(
          'authenticated'
        )
        expect(screen.getByLabelText('loading-state')).toHaveTextContent('idle')
      })
    })

    it('should never expose an unauthenticated+idle state while validating a session token', async () => {
      // This is the core regression test for the render-cycle gap.
      // Before the pendingAuthValidation fix, there was one render where
      // refreshedSession.isLoading flipped to false before useEffect set
      // currentUser — leaving loading=false AND authenticated=false, which
      // caused createRoleLabel to return "Unavailable" permanently.
      const client = makeClient()
      let sawUnauthenticatedWhileIdle = false

      const TrackingContent: React.FC = () => {
        const { authenticated, loading } = useTethysApiContext()
        if (!loading && !authenticated) {
          sawUnauthenticatedWhileIdle = true
        }
        return (
          <div aria-label="auth-state">
            {authenticated ? 'authenticated' : 'unauthenticated'}
          </div>
        )
      }

      render(
        <QueryClientProvider client={client}>
          <TethysApiProvider
            sessionToken="fake-session-token"
            setSessionToken={() => {}}
          >
            <TrackingContent />
          </TethysApiProvider>
        </QueryClientProvider>
      )

      await waitFor(() =>
        expect(screen.getByLabelText('auth-state')).toHaveTextContent(
          'authenticated'
        )
      )

      expect(sawUnauthenticatedWhileIdle).toBe(false)
    })

    it('should show the login prompt when the session token expires during an active session', async () => {
      // Simulate an active session followed by a token expiry (401). The user
      // should see the login button, not a broken "authenticated" state with
      // an expired token and "uu" initials.
      const client = makeClient()

      // Start fully authenticated via the normal token refresh path.
      render(<MockComponent client={client} testToken="fake-session-token" />)
      await waitFor(() =>
        expect(
          screen.getByLabelText('auth-content-logout-button')
        ).toBeInTheDocument()
      )

      // Now simulate the token expiring — next refresh returns 401.
      server.use(
        rest.get('/user/token', (_req, res, ctx) => res(ctx.status(401)))
      )

      // Invalidate the query so it re-fires immediately (simulates staleTime expiry).
      client.invalidateQueries(['token'])

      await waitFor(() =>
        expect(
          screen.getByLabelText('auth-content-login-button')
        ).toBeInTheDocument()
      )
      expect(
        screen.queryByLabelText('auth-content-logout-button')
      ).not.toBeInTheDocument()
    })

    it('should clear loading state after token refresh fails without getting stuck', async () => {
      server.use(
        rest.get('/user/token', (_req, res, ctx) => res(ctx.status(500)))
      )
      const client = makeClient()
      render(
        <MockLoadingComponent client={client} testToken="fake-session-token" />
      )

      await waitFor(() =>
        expect(screen.getByLabelText('loading-state')).toHaveTextContent('idle')
      )
      expect(screen.getByLabelText('auth-state')).toHaveTextContent(
        'unauthenticated'
      )
    })

    it('should preserve the session cookie when token refresh fails', async () => {
      // Regression test for onSettled → onSuccess fix.
      // Before the fix, onSettled called setSessionToken('') on any error,
      // wiping the cookie and causing permanent logout.
      server.use(
        rest.get('/user/token', (_req, res, ctx) => res(ctx.status(500)))
      )
      const mockSetToken = jest.fn()
      const client = makeClient()
      render(
        <MockLoadingComponent
          client={client}
          testToken="fake-session-token"
          setSessionToken={mockSetToken}
        />
      )

      await waitFor(() =>
        expect(screen.getByLabelText('loading-state')).toHaveTextContent('idle')
      )

      // setSessionToken must never be called with '' — that would clear the cookie
      expect(mockSetToken).not.toHaveBeenCalledWith('')
    })
  })
})
