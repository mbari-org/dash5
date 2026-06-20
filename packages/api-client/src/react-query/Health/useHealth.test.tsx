import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useHealth } from './useHealth'

const mockHealth = {
  result: {
    atIso: '2026-06-19T00:00:00Z',
    asyncConnections: 4,
    freeMemory: 512 * 1024 * 1024,
    maxMemory: 2048 * 1024 * 1024,
    totalMemory: 1024 * 1024 * 1024,
    availableProcessors: 8,
    application: 'TethysDash',
    version: '5.0.0',
    build: '1234',
    appInstance: 'okeanids',
    javaVersion: '17.0.1',
  },
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => res(ctx.status(200), ctx.json({}))),
  rest.get('/health', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockHealth))
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockComponent: React.FC = () => {
  const { data, isLoading, isError } = useHealth()
  if (isLoading) return <div>loading</div>
  if (isError) return <div>error</div>
  return <div>{data?.version ?? 'no data'}</div>
}

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('useHealth', () => {
  it('fetches and renders health data', async () => {
    render(
      <MockProviders queryClient={makeClient()}>
        <MockComponent />
      </MockProviders>
    )
    await waitFor(() => expect(screen.getByText('5.0.0')).toBeInTheDocument(), {
      timeout: 5000,
    })
  })

  it('shows error state when the health request fails', async () => {
    server.use(
      rest.get('/health', (_req, res, ctx) => res.once(ctx.status(500)))
    )
    render(
      <MockProviders queryClient={makeClient()}>
        <MockComponent />
      </MockProviders>
    )
    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument(), {
      timeout: 5000,
    })
  })
})
