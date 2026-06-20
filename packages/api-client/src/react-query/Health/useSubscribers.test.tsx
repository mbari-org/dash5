import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders, mockAuthResponse } from '../queryTestHelpers'
import { useSubscribers } from './useSubscribers'

const mockSubscribers = {
  result: {
    'operator@mbari.org': {
      sessions: [{ tduiv: '5.1.42', openedMs: 0, session: 'abc123' }],
    },
  },
}

let capturedAuthHeader: string | null = null

const server = setupServer(
  rest.get('/user/token', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockAuthResponse))
  ),
  rest.get('/async/subscribers', (req, res, ctx) => {
    capturedAuthHeader = req.headers.get('Authorization')
    return res(ctx.status(200), ctx.json(mockSubscribers))
  })
)

beforeAll(() => server.listen())
beforeEach(() => {
  capturedAuthHeader = null
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockComponent: React.FC = () => {
  const { data, isLoading, isError } = useSubscribers()
  if (isLoading) return <div>loading</div>
  if (isError) return <div>error</div>
  const emails = data ? Object.keys(data) : []
  return (
    <ul>
      {emails.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  )
}

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('useSubscribers', () => {
  it('fetches and renders subscriber data when authenticated', async () => {
    render(
      <MockProviders
        queryClient={makeClient()}
        testToken={mockAuthResponse.result.token}
      >
        <MockComponent />
      </MockProviders>
    )
    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByText('operator@mbari.org')).toBeInTheDocument()
  })

  it('sends an Authorization header', async () => {
    render(
      <MockProviders
        queryClient={makeClient()}
        testToken={mockAuthResponse.result.token}
      >
        <MockComponent />
      </MockProviders>
    )
    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(capturedAuthHeader).toMatch(/^Bearer /)
  })

  it('does not fetch when no token is present', async () => {
    render(
      <MockProviders queryClient={makeClient()} testToken="">
        <MockComponent />
      </MockProviders>
    )
    // stays in loading (query disabled) — subscribers endpoint should not be called
    await new Promise((r) => setTimeout(r, 50))
    expect(capturedAuthHeader).toBeNull()
  })

  it('shows error state on 403', async () => {
    server.use(
      rest.get('/async/subscribers', (_req, res, ctx) =>
        res.once(ctx.status(403))
      )
    )
    render(
      <MockProviders
        queryClient={makeClient()}
        testToken={mockAuthResponse.result.token}
      >
        <MockComponent />
      </MockProviders>
    )
    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByText('error')).toBeInTheDocument()
  })
})
