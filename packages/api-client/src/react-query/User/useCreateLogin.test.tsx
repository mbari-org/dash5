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
      return screen.getByText(mockResponse.result.token)
    })

    expect(screen.queryByText(mockResponse.result.token)).toHaveTextContent(
      mockResponse.result.token
    )
  })
})
