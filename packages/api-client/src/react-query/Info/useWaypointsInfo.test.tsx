import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useWaypointsInfo } from './useWaypointsInfo'

const mockResponse = {
  result: {
    missionStartedEvent: {
      name: 'Mock Mission',
      unixTime: 0,
    },
    latestPosition: {
      lat: 1.23,
      lon: 4.56,
      unixTime: 1000,
    },
    points: [
      {
        lat: 10,
        lon: 20,
        name: 'wp1',
        unixTime: 1,
      },
      {
        lat: 30,
        lon: 40,
        name: 'wp2',
        unixTime: 2,
      },
    ],
  },
}

const server = setupServer(
  rest.get('/wp', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockWaypointsInfo: React.FC = () => {
  const query = useWaypointsInfo({ vehicle: 'sim', to: 1710095743191 })
  return query.isLoading ? null : (
    <div>
      <span data-testid="missionName">
        {query.data?.missionStartedEvent?.name ?? 'Loading'}
      </span>
      <span data-testid="latestLon">
        {query.data?.latestPosition?.lon ?? 'Loading'}
      </span>
      <span data-testid="firstPointName">
        {query.data?.points[0].name ?? 'Loading'}
      </span>
      <span data-testid="vehicleName">
        {query.data?.vehicleName ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useWaypointsInfo', () => {
  it('should render the mission name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockWaypointsInfo />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result.missionStartedEvent.name)
    })

    expect(screen.getByTestId('missionName')).toHaveTextContent(
      mockResponse.result.missionStartedEvent.name
    )
  })

  it('should render the latest position longitude', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockWaypointsInfo />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(String(mockResponse.result.latestPosition.lon))
    })

    expect(screen.getByTestId('latestLon')).toHaveTextContent(
      String(mockResponse.result.latestPosition.lon)
    )
  })

  it('should render the first waypoint name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockWaypointsInfo />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result.points[0].name as string)
    })

    expect(screen.getByTestId('firstPointName')).toHaveTextContent(
      mockResponse.result.points[0].name as string
    )
  })

  it('should render the vehicle name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockWaypointsInfo />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText('sim')
    })

    expect(screen.getByTestId('vehicleName')).toHaveTextContent('sim')
  })
})
