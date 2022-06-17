import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useVehiclePos } from './useVehiclePos'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  gpsFixes: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'This is a GPS FIX',
      text: 'string',
    },
  ],
  argoReceives: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'This is an ARGO RECEIVES',
      text: 'string',
    },
  ],
  emergencies: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'This is an EMERGENCY',
      text: 'string',
    },
  ],
  reachedWaypoints: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'This is a REACHED WAYPOINT',
      text: 'string',
    },
  ],
}

const server = setupServer(
  rest.get('/vpos', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehiclePosition: React.FC = () => {
  const query = useVehiclePos({
    vehicle: 'pontus',
    from: '2022-06-16',
  })
  return query.isLoading ? null : (
    <div>
      <span data-testid="gpsFix">
        {query.data?.gpsFixes[0].note ?? 'Loading'}
      </span>
      <span data-testid="argoRecieves">
        {query.data?.argoReceives[0].note ?? 'Loading'}
      </span>
      <span data-testid="emergency">
        {query.data?.emergencies[0].note ?? 'Loading'}
      </span>
      <span data-testid="reachedWaypoint">
        {query.data?.reachedWaypoints[0].note ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useVehiclePos', () => {
  it('should render the gps fix', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehiclePosition />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.gpsFixes[0].note)
    })

    expect(screen.getByTestId('gpsFix')).toHaveTextContent(
      mockResponse.gpsFixes[0].note
    )
  })

  it('should render the argo receives', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehiclePosition />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.argoReceives[0].note)
    })

    expect(screen.getByTestId('argoRecieves')).toHaveTextContent(
      mockResponse.argoReceives[0].note
    )
  })

  it('should render the emergency', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehiclePosition />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.emergencies[0].note)
    })

    expect(screen.getByTestId('emergency')).toHaveTextContent(
      mockResponse.emergencies[0].note
    )
  })

  it('should render the reached waypoint', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehiclePosition />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.reachedWaypoints[0].note)
    })

    expect(screen.getByTestId('reachedWaypoint')).toHaveTextContent(
      mockResponse.reachedWaypoints[0].note
    )
  })
})
