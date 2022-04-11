jest.unmock('axios') // Do this just in case the library is already mocked
import '@testing-library/jest-dom'
import React from 'react'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { AuthProvider } from './AuthProvider'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuthContext } from './useAuthContext'
import { QueryClientProvider, QueryClient } from 'react-query'

const queryClient = new QueryClient()
const mockResponse = { token: 'authentication-token' }

const AuthContent: React.FC = () => {
  const { authenticated, token, login, logout, error } = useAuthContext()
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

describe('AuthProvider', () => {
  let mock: MockAdapter
  const MockComponent: React.FC = () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthContent />
      </AuthProvider>
    </QueryClientProvider>
  )

  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  it('should render the login button if not authenticated', async () => {
    render(<MockComponent />)
    expect(
      screen.getByLabelText(/auth-content-login-button/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-error/i)
    ).not.toBeInTheDocument()
  })

  it('should not render the authenticated content if not authenticated', async () => {
    render(<MockComponent />)
    expect(
      screen.queryByLabelText(/auth-content-token/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).not.toBeInTheDocument()
  })

  it('should render the logout button and auth token after the user authenticates', async () => {
    mock.onPost('/user/auth').reply(200, mockResponse)

    render(<MockComponent />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-token')
    )
    expect(screen.queryByLabelText(/auth-content-token/i)).toHaveTextContent(
      mockResponse.token
    )
    expect(
      screen.getByLabelText(/auth-content-logout-button/i)
    ).toBeInTheDocument()
  })

  it('should not render the logout button and auth token if the user authentication fails', async () => {
    mock.onPost('/user/auth').reply(500)

    render(<MockComponent />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-token')
    )
    expect(
      screen.queryByLabelText(/auth-content-token/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).not.toBeInTheDocument()
  })

  it('should render an error if the user authentication fails', async () => {
    mock.onPost('/user/auth').reply(500)

    render(<MockComponent />)
    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-token')
    )
    expect(screen.queryByLabelText(/auth-content-error/i)).toBeInTheDocument()
  })

  it('should clear an error if the user authenticates successfully after failure', async () => {
    render(<MockComponent />)

    mock.onPost('/user/auth').reply(500)

    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-token')
    )
    expect(screen.queryByLabelText(/auth-content-error/i)).toBeInTheDocument()

    mock.onPost('/user/auth').reply(200, mockResponse)

    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-logout-button')
    )
    expect(
      screen.queryByLabelText(/auth-content-error/i)
    ).not.toBeInTheDocument()
  })

  it('should logout the user if the user clicks the logout button after authenticating', async () => {
    render(<MockComponent />)

    mock.onPost('/user/auth').reply(200, mockResponse)

    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-logout-button')
    )
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-login-button/i)
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('logout'))

    await waitFor(() =>
      // getByRole throws an error if it cannot find an element
      screen.queryByLabelText('auth-content-login-button')
    )
    expect(
      screen.queryByLabelText(/auth-content-login-button/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/auth-content-logout-button/i)
    ).not.toBeInTheDocument()
  })
})
