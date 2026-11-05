import '@testing-library/jest-dom'
import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { usePlatformPositions } from './usePlatformPositions'

const PLATFORM_ID = '54065b5560d0e168c88d4012'

const mockResponse = {
  platformId: PLATFORM_ID,
  platformName: 'ShanaRae',
  positions: [
    { timeMs: 1609459200000, lat: 36.8, lon: -122.0 },
    { timeMs: 1609459260000, lat: 36.801, lon: -122.001 },
  ],
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get(`/trackdb/platforms/${PLATFORM_ID}/positions`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockPositions: React.FC<{ platformId: string }> = ({ platformId }) => {
  const { isLoading, data, isError } = usePlatformPositions({ platformId })

  if (isLoading) return <div data-testid="loading" />
  if (isError) return <div data-testid="error" />
  return (
    <div>{data && <span data-testid="result">{data.platformName}</span>}</div>
  )
}

// Exposes both error and data state simultaneously so we can assert that stale
// data is still available even after a refetch failure.
const MockHookState: React.FC<{ platformId: string }> = ({ platformId }) => {
  const { data, isError } = usePlatformPositions({ platformId })
  return (
    <div>
      <span data-testid="error-state">{isError ? 'error' : 'ok'}</span>
      <span data-testid="data-state">
        {data?.positions?.length ? 'has-data' : 'no-data'}
      </span>
    </div>
  )
}

describe('usePlatformPositions', () => {
  it('should return positions data on success', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockPositions platformId={PLATFORM_ID} />
      </MockProviders>
    )

    await waitFor(() => screen.getByTestId('result'))
    expect(screen.getByTestId('result')).toHaveTextContent('ShanaRae')
  })

  it('should not retry on failure (retry: 0) — request fires exactly once', async () => {
    // Verifies retry: 0 is in effect. Without it, React Query would retry 3×,
    // meaning ~60 s before an error surfaces on a 15-s timeout (#837).
    let requestCount = 0
    server.use(
      rest.get(
        `/trackdb/platforms/${PLATFORM_ID}/positions`,
        (_req, res, ctx) => {
          requestCount++
          return res.once(ctx.status(500))
        }
      )
    )

    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockPositions platformId={PLATFORM_ID} />
      </MockProviders>
    )

    await waitFor(() => screen.getByTestId('error'))
    expect(requestCount).toBe(1)
  })

  it('should keep previous data when a refetch fails (keepPreviousData: true)', async () => {
    // Verifies the reporter's ask: "avoid failure to display of the previously
    // successfully loaded track even if the current fetch times out" (#837).
    // After a successful first fetch, a failing refetch should leave data intact
    // alongside isError — the track stays visible rather than disappearing.
    const queryClient = new QueryClient()
    render(
      <MockProviders queryClient={queryClient}>
        <MockHookState platformId={PLATFORM_ID} />
      </MockProviders>
    )

    // Wait for the initial successful fetch
    await waitFor(() =>
      expect(screen.getByTestId('data-state')).toHaveTextContent('has-data')
    )
    expect(screen.getByTestId('error-state')).toHaveTextContent('ok')

    // Make the next fetch fail (simulates a timeout or server error on refetch)
    server.use(
      rest.get(
        `/trackdb/platforms/${PLATFORM_ID}/positions`,
        (_req, res, ctx) => res.once(ctx.status(500))
      )
    )

    // Force a refetch — stale data must still be present alongside the error
    await act(async () => {
      await queryClient.invalidateQueries([
        'trackdb',
        'platforms',
        PLATFORM_ID,
        'positions',
      ])
    })

    await waitFor(() =>
      expect(screen.getByTestId('error-state')).toHaveTextContent('error')
    )
    // data is still defined — the stale track remains available to render
    expect(screen.getByTestId('data-state')).toHaveTextContent('has-data')
  })
})
