import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useChartData } from './useChartData'
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

const server = setupServer(
  rest.get('/info', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockInfoResponse))
  ),
  rest.get('/events', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockDataProcessedEvent))
  ),
  rest.get(/chartData2\.json$/, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ chartData: mockChartData }))
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, cacheTime: 0 },
    },
  })

const MockConsumer: React.FC<{ options?: { enabled?: boolean } }> = ({
  options,
}) => {
  const { data, isLoading, isError, error } = useChartData(
    { vehicle: 'ahi', from: 1747000000000 },
    options
  )

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div data-testid="error">{(error as Error).message}</div>
  if (!data) return <div>No data</div>

  return (
    <div>
      <span data-testid="count">{data.length}</span>
      <span data-testid="first-name">{data[0].name}</span>
    </div>
  )
}

describe('useChartData', () => {
  it('fetches chart data when no options are passed (enabled defaults to true)', async () => {
    render(
      <MockProviders queryClient={makeQueryClient()}>
        <MockConsumer />
      </MockProviders>
    )

    await waitFor(
      () => expect(screen.getByTestId('count')).toHaveTextContent('2'),
      { timeout: 5000 }
    )
    expect(screen.getByTestId('first-name')).toHaveTextContent('depth')
  })

  it('does not fetch when options.enabled is false', async () => {
    render(
      <MockProviders queryClient={makeQueryClient()}>
        <MockConsumer options={{ enabled: false }} />
      </MockProviders>
    )

    // Should stay in idle/no-data state since queries are disabled
    await new Promise((r) => setTimeout(r, 500))
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('shows an error when chartData2.json returns malformed data', async () => {
    server.use(
      rest.get(/chartData2\.json$/, (_req, res, ctx) =>
        // Return a non-array chartData (simulates malformed JSON from backend)
        res(ctx.status(200), ctx.json({ chartData: 'malformed' }))
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
    expect(screen.getByTestId('error').textContent).toMatch(/invalid data/)
  })
})
