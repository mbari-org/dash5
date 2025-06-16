import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRecentRuns } from './useRecentRuns'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

// Mock events containing various mission names (including ones with digits and underscores) to
// ensure the regex in `useRecentRuns` properly extracts them.
const mockResponse = {
  result: [
    {
      eventId: 1,
      vehicleName: 'brizo',
      unixTime: 1718512400000,
      isoTime: '2024-06-16T04:00:00.000Z',
      eventType: 'run',
      user: 'Brian Kieft',
      data: 'load Science/sci2.tl;set sci2.MissionTimeout 4 h;set sci2.Lat1 36.903 degree;set sci2.Lon1 -122.11055 degree;set sci2.YoYoMinDepth 5 m;set sci2.YoYoMaxDepth 30 m;run',
    },
    {
      eventId: 2,
      vehicleName: 'brizo',
      unixTime: 1718512300000,
      isoTime: '2024-06-16T03:58:20.000Z',
      eventType: 'run',
      user: 'Brian Kieft',
      data: 'sched asap "load Science/profile_station.tl;set profile_station.MissionTimeout 6 h;set profile_station.NeedCommsTime 60 min;set profile_station.Lat 36.9057 degree;set profile_station.Lon -122.1161 degree;set profile_station.YoYoMinDepth 5 m" 2v4l8 1 2\nsched asap "set profile_station.YoYoMaxDepth 30 m;set profile_station.Speed 1.0 m/s;run" 2v4l8 2 2',
    },
    {
      eventId: 3,
      vehicleName: 'brizo',
      unixTime: 1718512200000,
      isoTime: '2024-06-16T03:56:40.000Z',
      eventType: 'run',
      user: 'Chris Preston',
      data: 'load Maintenance/ballast_and_trim.tl;set ballast_and_trim.Depth1 15 m;run',
    },
    {
      eventId: 4,
      vehicleName: 'brizo',
      unixTime: 1718512100000,
      isoTime: '2024-06-16T03:55:00.000Z',
      eventType: 'run',
      user: 'Test User',
      data: 'sched 20250616T0415 "load Science/nested_dir/profile_station_12.tl;set profile_station_12.MissionTimeout 14 h;set profile_station_12.NeedCommsTime 60 min;set profile_station_12.Lat 36.797 degree;set profile_station_12.Lon -121.847 degree" 2t7vk 1 2\nsched 20250616T0415 "set profile_station_12.YoYoMaxDepth 35 m;set profile_station_12.Speed 0.9 m/s;run" 2t7vk 2 2',
    },
    {
      eventId: 5,
      vehicleName: 'brizo',
      unixTime: 1718512000000,
      isoTime: '2024-06-16T03:53:20.000Z',
      eventType: 'run',
      user: 'Test User',
      data: 'load Engineering/sink.tl;set sink.SinkDuration 1.5 h;set sink.Depth 15 m;set sink.DepthDeadband 5 m;run',
    },
  ],
}

const server = setupServer(
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockCommands: React.FC = () => {
  const query = useRecentRuns({ vehicles: ['sim'], from: 1710095743191 })

  return query.isLoading ? null : (
    <div>
      {query.data?.map((c, i) => (
        <span data-testid={`command${i}`} key={`command${i}`}>
          {c?.mission ?? 'Loading'}
        </span>
      ))}
    </div>
  )
}

describe('useRecentRuns', () => {
  it('should display the command keyword', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockCommands />
      </MockProviders>
    )

    await waitFor(() => screen.getByTestId('command4'))

    expect(screen.getByTestId('command0')).toHaveTextContent('Science/sci2.tl')
    expect(screen.getByTestId('command1')).toHaveTextContent(
      'Science/profile_station.tl'
    )
    expect(screen.getByTestId('command2')).toHaveTextContent(
      'Maintenance/ballast_and_trim.tl'
    )
    expect(screen.getByTestId('command3')).toHaveTextContent(
      'Science/nested_dir/profile_station_12.tl'
    )
    expect(screen.getByTestId('command4')).toHaveTextContent(
      'Engineering/sink.tl'
    )
  })
})
