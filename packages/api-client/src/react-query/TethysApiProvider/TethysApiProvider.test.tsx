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
})
