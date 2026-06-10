import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useDeploymentChartData } from './useDeploymentChartData'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockPath = '2026/202605/20260512T165508'

const mockDataProcessedEvent = {
  result: [
    {
      eventId: 99001,
      vehicleName: 'ahi',
      unixTime: 1747072508000,
      isoTime: '2026-05-12T16:55:08.000Z',
      eventType: 'dataProcessed',
      state: 0,
      user: 'tethysdash',
      path: mockPath,
    },
  ],
}

const mockChartData = [
  {
    name: 'depth',
    values: [10, 20, 30],
    times: [1000, 2000, 3000],
    units: 'm',
  },
  {
    name: 'temperature',
    values: [15, 16, 17],
    times: [1000, 2000, 3000],
    units: 'C',
  },
]

const mockVariableDepth = {
  name: 'depth',
  units: 'm',
  values: [10, 20, 30],
  times: [1000, 2000, 3000],
}

const mockVariableTemp = {
  name: 'temperature',
  units: 'C',
  values: [15, 16, 17],
  times: [1000, 2000, 3000],
}

const mockTethysDashUrl = 'http://localhost:3002/TethysDash/api'

const mockInfoResponse = {
  result: {
    vehicleNames: ['ahi'],
    vehicleBasicInfos: [],
    defaultVehicle: 'ahi',
    eventTypes: [],
    eventKinds: [],
    appConfig: {
      version: '1.0.0',
      external: {
        base: '',
        dashui: '',
        eventTypeDoc: '',
        miscLinksFile: '',
        schemaBase: '',
        tethysdash: mockTethysDashUrl,
        useradmin: '',
        statusWidgets: {
          espStatusWidgetUrlPattern: '',
          lrauvStatusWidgetUrlPattern: '',
        },
      },
      googleApiKey: '',
      odss2dashApi: '',
      recaptcha: { siteKey: '' },
      slack: { primaryChannel: '' },
      webSockets: { useWebsocket: false, maxIdleTimeout: 0 },
      pusher: { appKey: '', eventChannel: '', cluster: '' },
    },
  },
}

let lastVariableRequest: { url: URL } | null = null

const server = setupServer(
  rest.get('/info', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockInfoResponse))
  ),
  rest.get('/events', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockDataProcessedEvent))
  ),
  rest.get(/chartData2\.json$/, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ chartData: mockChartData }))
  ),
  rest.get(/\/data\/depth/, (req, res, ctx) => {
    lastVariableRequest = { url: req.url }
    return res(ctx.status(200), ctx.json(mockVariableDepth))
  }),
  rest.get(/\/data\/temperature/, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockVariableTemp))
  )
)

beforeAll(() => server.listen())
beforeEach(() => {
  lastVariableRequest = null
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, cacheTime: 0 },
    },
  })

const VALID_FROM = 1747000000000 // ~ 2025-05-12 — well above the 1e12 guard

const MockConsumer: React.FC<{
  deploymentFrom?: number
  from?: number
  options?: { enabled?: boolean }
}> = ({ deploymentFrom = VALID_FROM, from = VALID_FROM, options }) => {
  const { data, isLoading, isError } = useDeploymentChartData(
    { vehicle: 'ahi', deploymentFrom, from },
    options
  )

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div data-testid="error">Error</div>
  if (!data) return <div>No data</div>

  return (
    <div>
      <span data-testid="count">{data.length}</span>
      <span data-testid="first-name">{data[0].name}</span>
    </div>
  )
}

describe('useDeploymentChartData', () => {
  it('fetches and returns variable data for a valid time window', async () => {
    render(
      <MockProviders queryClient={makeQueryClient()}>
        <MockConsumer />
      </MockProviders>
    )

    await waitFor(
      () => expect(screen.getByTestId('count')).toBeInTheDocument(),
      { timeout: 5000 }
    )
    expect(
      parseInt(screen.getByTestId('count').textContent ?? '0')
    ).toBeGreaterThan(0)
    expect(screen.getByTestId('first-name')).toHaveTextContent('depth')
  })

  it('does not fire any queries when options.enabled is false', async () => {
    render(
      <MockProviders queryClient={makeQueryClient()}>
        <MockConsumer options={{ enabled: false }} />
      </MockProviders>
    )

    expect(screen.getByText('No data')).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, 100))
    expect(screen.queryByTestId('count')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error')).not.toBeInTheDocument()
  })

  it('does not fire the events query when from is near-epoch (prevents 400 errors)', async () => {
    let eventsCallCount = 0
    server.use(
      rest.get('/events', (_req, res, ctx) => {
        eventsCallCount++
        return res(ctx.status(200), ctx.json(mockDataProcessedEvent))
      })
    )

    render(
      <MockProviders queryClient={makeQueryClient()}>
        {/* deploymentFrom=1 simulates an unloaded deployment start time */}
        <MockConsumer deploymentFrom={1} from={1} />
      </MockProviders>
    )

    // The "No data" state should appear immediately (query is disabled)
    expect(screen.getByText('No data')).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, 200))
    expect(eventsCallCount).toBe(0)
  })

  it('surfaces isError when chartData2.json contains invalid data', async () => {
    server.use(
      rest.get(/chartData2\.json$/, (_req, res, ctx) =>
        res(ctx.status(200), ctx.json({ chartData: 'not-an-array' }))
      )
    )

    render(
      <MockProviders queryClient={makeQueryClient()}>
        <MockConsumer />
      </MockProviders>
    )

    await waitFor(
      () => expect(screen.getByTestId('error')).toBeInTheDocument(),
      { timeout: 5000 }
    )
  })

  it('passes from and to as query params to per-variable requests', async () => {
    const from = VALID_FROM
    const to = VALID_FROM + 86_400_000 // +24 hours

    const MockConsumerWithTo: React.FC = () => {
      const { data, isLoading, isError } = useDeploymentChartData({
        vehicle: 'ahi',
        deploymentFrom: VALID_FROM,
        from,
        to,
      })
      if (isLoading) return <div>Loading...</div>
      if (isError) return <div data-testid="error">Error</div>
      if (!data) return <div>No data</div>
      return <div data-testid="count">{data.length}</div>
    }

    render(
      <MockProviders queryClient={makeQueryClient()}>
        <MockConsumerWithTo />
      </MockProviders>
    )

    await waitFor(
      () => expect(screen.getByTestId('count')).toBeInTheDocument(),
      { timeout: 5000 }
    )

    expect(lastVariableRequest?.url.searchParams.get('from')).toBe(String(from))
    expect(lastVariableRequest?.url.searchParams.get('to')).toBe(String(to))
  })
})
