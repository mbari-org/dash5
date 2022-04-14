import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useCreateLogin } from './useCreateLogin'
import { QueryClientProvider, QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient()
const mockResponse = { token: 'authentication-token' }

let email: 'test@example.com'
let password: 'password'

const MockLogin: React.FC = () => {
  const createLogin = useCreateLogin()
  return (
    <button
      data-testid="button"
      onClick={() => {
        createLogin.mutate({ email, password })
      }}
    >
      {createLogin.data?.token ?? 'Not logged in'}
    </button>
  )
}

const MockComponent: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <MockLogin />
  </QueryClientProvider>
)

describe('useCreateLogin', () => {
  it('should render the logout button and auth token after the user authenticates', async () => {
    server.use(
      rest.post('/user/auth', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )

    render(<MockComponent />)
    fireEvent.click(screen.getByTestId('button'))
    await waitFor(() => {
      return screen.getByText(mockResponse.token)
    })

    expect(screen.queryByText(mockResponse.token)).toHaveTextContent(
      mockResponse.token
    )
  })
})
