import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useDepthSparkline } from './useDepthSparkline'

// Fixed "now" keeps timestamps deterministic.
// We only mock Date.now() rather than using fake timers to avoid interfering
// with MSW and React Query's internal async scheduling.
const NOW_MS = 1_700_000_000_000
const NOW_MIN = Math.floor(NOW_MS / 60000)
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000

let dateNowSpy: jest.SpyInstance
beforeAll(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW_MS)
})
afterAll(() => {
  dateNowSpy.mockRestore()
})

// Depth data — last point is 2 min ago, well within the 4-min padding threshold.
const depthMockResponse = {
  times: [
    (NOW_MIN - 300) * 60000, // ms epoch
    (NOW_MIN - 2) * 60000, // 2 min ago — too recent to trigger padding
  ],
  values: [80, 40],
}

// Comms events: one gpsFix, one sat sbdReceive (state 0), one cell sbdReceive (state 2), one argo.
const commsMockResponse = {
  result: [
    {
      eventId: 1,
      vehicleName: 'brizo',
      unixTime: NOW_MS - 60 * 60 * 1000, // 1h ago
      isoTime: '',
      eventType: 'gpsFix',
      state: 0,
    },
    {
      eventId: 2,
      vehicleName: 'brizo',
      unixTime: NOW_MS - 2 * 60 * 60 * 1000, // 2h ago
      isoTime: '',
      eventType: 'sbdReceive',
      state: 0, // sat
    },
    {
      eventId: 3,
      vehicleName: 'brizo',
      unixTime: NOW_MS - 3 * 60 * 60 * 1000, // 3h ago
      isoTime: '',
      eventType: 'sbdReceive',
      state: 2, // cell
    },
    {
      eventId: 4,
      vehicleName: 'brizo',
      unixTime: NOW_MS - 4 * 60 * 60 * 1000, // 4h ago
      isoTime: '',
      eventType: 'argoReceive',
      state: 0,
    },
    // This event is outside the 8-hour window — should be excluded.
    {
      eventId: 5,
      vehicleName: 'brizo',
      unixTime: NOW_MS - EIGHT_HOURS_MS - 60 * 1000,
      isoTime: '',
      eventType: 'gpsFix',
      state: 0,
    },
  ],
}

const server = setupServer(
  rest.get('/data/depth', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(depthMockResponse))
  ),
  rest.get('/events', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(commsMockResponse))
  ),
  rest.get('/info', (_req, res, ctx) => res(ctx.status(200), ctx.json({})))
)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ── Test component ────────────────────────────────────────────────────────────

const SparklineConsumer: React.FC<{ vehicle: string }> = ({ vehicle }) => {
  const { data, isLoading } = useDepthSparkline({ vehicle })

  if (isLoading) return <div>loading</div>

  return (
    <div>
      <span data-testid="depthLen">{data.depthTimes.length}</span>
      <span data-testid="padded">{String(data.padded)}</span>
      <span data-testid="gpsTimes">{data.gpsTimes.length}</span>
      <span data-testid="satTimes">{data.satTimes.length}</span>
      <span data-testid="celTimes">{data.celTimes.length}</span>
      <span data-testid="argoTimes">{data.argoTimes.length}</span>
    </div>
  )
}

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, cacheTime: 0 },
    },
  })

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useDepthSparkline', () => {
  it('activates the fallback query when the primary depth endpoint returns 404', async () => {
    // Fallback data: surface point followed by a dive
    const fallbackTimes = [
      (NOW_MIN - 20) * 60000, // surface
      (NOW_MIN - 15) * 60000,
      (NOW_MIN - 10) * 60000,
    ]
    const fallbackValues = [2, 30, 60]

    server.use(
      rest.get('/data/depth', (req, res, ctx) => {
        // Primary (with `from` param) → 404; fallback (no `from`) → 200
        if (req.url.searchParams.has('from')) {
          return res(ctx.status(404))
        }
        return res(
          ctx.status(200),
          ctx.json({ times: fallbackTimes, values: fallbackValues })
        )
      })
    )

    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    // Fallback trims to current dive (from last surface point at index 0).
    // Last point is 10 min old → padding adds 3 more → 3 data + 3 pad = 6.
    await waitFor(() =>
      expect(screen.getByTestId('depthLen')).not.toHaveTextContent('0')
    )
    expect(screen.getByTestId('depthLen')).toHaveTextContent('6')
    expect(screen.getByTestId('padded')).toHaveTextContent('true')
  })

  it('trims fallback data to the current dive (after last surface point)', async () => {
    // Two dives: older dive (deep), surface, current dive (shallow)
    const fallbackTimes = [
      (NOW_MIN - 600) * 60000, // prior dive
      (NOW_MIN - 500) * 60000, // prior dive
      (NOW_MIN - 400) * 60000, // surface between dives
      (NOW_MIN - 300) * 60000, // current dive start
      (NOW_MIN - 200) * 60000, // current dive mid
      (NOW_MIN - 100) * 60000, // current dive deep
    ]
    const fallbackValues = [120, 150, 2, 10, 30, 40]

    server.use(
      rest.get('/data/depth', (req, res, ctx) => {
        if (req.url.searchParams.has('from')) {
          return res(ctx.status(404))
        }
        return res(
          ctx.status(200),
          ctx.json({ times: fallbackTimes, values: fallbackValues })
        )
      })
    )

    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    // Only the 4 points from the last surface onward (indices 2–5) should appear
    // (plus padding since last point is >4 min old → +3 pad points = 7 total).
    await waitFor(() =>
      expect(screen.getByTestId('depthLen')).not.toHaveTextContent('0')
    )
    // 4 current-dive points + 3 pad points
    expect(screen.getByTestId('depthLen')).toHaveTextContent('7')
    expect(screen.getByTestId('padded')).toHaveTextContent('true')
  })

  it('returns depth times clamped to the 8-hour window', async () => {
    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    await waitFor(() =>
      expect(screen.getByTestId('depthLen')).not.toHaveTextContent('0')
    )
    // Both mock depth points are within the window.
    expect(screen.getByTestId('depthLen')).toHaveTextContent('2')
  })

  it('marks padded=false when depth data is recent (gap ≤ 4 min)', async () => {
    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('padded')).toHaveTextContent('false')
  })

  it('marks padded=true when last depth point is >4 min old', async () => {
    // Override depth endpoint — last point is 10 minutes old.
    server.use(
      rest.get('/data/depth', (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({
            times: [(NOW_MIN - 10) * 60000],
            values: [50],
          })
        )
      )
    )

    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('padded')).toHaveTextContent('true')
  })

  it('correctly splits sbdReceive events into sat (state 0) and cell (state 2)', async () => {
    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('satTimes')).toHaveTextContent('1')
    expect(screen.getByTestId('celTimes')).toHaveTextContent('1')
  })

  it('populates gpsTimes and argoTimes from their respective event types', async () => {
    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('gpsTimes')).toHaveTextContent('1')
    expect(screen.getByTestId('argoTimes')).toHaveTextContent('1')
  })

  it('excludes comms events outside the 8-hour window', async () => {
    // commsMockResponse includes one out-of-window gpsFix (event id 5).
    // gpsTimes should still be 1, not 2.
    render(
      <MockProviders queryClient={makeClient()}>
        <SparklineConsumer vehicle="brizo" />
      </MockProviders>
    )

    await waitFor(() =>
      expect(screen.queryByText('loading')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('gpsTimes')).toHaveTextContent('1')
  })
})
