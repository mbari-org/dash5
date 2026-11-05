import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

  it('should keep previous data while refetching (keepPreviousData: true)', async () => {
    // Verifies the reporter's ask: "avoid failure to display of the previously
    // successfully loaded track even if the current fetch times out" (#837).
    // When the query key changes (new platformId), previously fetched data
    // remains available rather than being cleared to undefined.
    const NEW_PLATFORM_ID = '54065b5560d0e168c88d4099'
    server.use(
      rest.get(
        `/trackdb/platforms/${NEW_PLATFORM_ID}/positions`,
        (_req, res, ctx) => {
          return res(
            ctx.delay(100),
            ctx.status(200),
            ctx.json({
              ...mockResponse,
              platformId: NEW_PLATFORM_ID,
              platformName: 'D_PACKARD',
            })
          )
        }
      )
    )

    // Reuse the same QueryClient so the cache from the first fetch is available
    // when the query key changes — keepPreviousData only works within one client.
    const queryClient = new QueryClient()
    const { rerender } = render(
      <MockProviders queryClient={queryClient}>
        <MockPositions platformId={PLATFORM_ID} />
      </MockProviders>
    )

    // Wait for initial data to load
    await waitFor(() => screen.getByTestId('result'))
    expect(screen.getByTestId('result')).toHaveTextContent('ShanaRae')

    // Switch to a new platform — previous data stays visible during the fetch
    rerender(
      <MockProviders queryClient={queryClient}>
        <MockPositions platformId={NEW_PLATFORM_ID} />
      </MockProviders>
    )

    // Should not flash to loading state — previous data still shown
    expect(screen.queryByTestId('loading')).toBeNull()

    // Eventually resolves to the new platform
    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent('D_PACKARD')
    )
  })
})
