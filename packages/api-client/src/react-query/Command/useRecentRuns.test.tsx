import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRecentRuns } from './useRecentRuns'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: [
    {
      eventId: 17097188,
      vehicleName: 'brizo',
      unixTime: 1660056630848,
      isoTime: '2022-08-09T14:50:30.848Z',
      eventType: 'run',
      user: 'Brian Kieft',
      data: 'sched asap "load Science/profile_station.xml;set profile_station.MissionTimeout 4 h;set profile_station.NeedCommsTime 30 min;set profile_station.Lat 43.9375 degree;set profile_station.Lon -86.499304 degree;set profile_station.YoYoMaxDepth 4 m" p7w6 1 2\nsched asap "set profile_station.YoYoPitch 12 degree;set profile_station.Speed 0.8 m/s;set profile_station.MaxDepth 9 m;set profile_station.MinOffshore 0.5 km;run" p7w6 2 2',
    },
    {
      eventId: 17097032,
      vehicleName: 'brizo',
      unixTime: 1660013627155,
      isoTime: '2022-08-09T02:53:47.155Z',
      eventType: 'run',
      user: 'Brian Kieft',
      data: 'sched asap "load Science/profile_station.tl;set profile_station.MissionTimeout 10 h;set profile_station.NeedCommsTime 60 min;set profile_station.Lat 43.92975 degree;set profile_station.Lon -86.5052 degree;set profile_station.YoYoMaxDepth 4 m" oapn 1 2\nsched asap "set profile_station.YoYoPitch 12 degree;set profile_station.Speed 0.8 m/s;set profile_station.MaxDepth 9 m;set profile_station.MinOffshore 0.5 km;run" oapn 2 2',
    },
    {
      eventId: 17096967,
      vehicleName: 'brizo',
      unixTime: 1660001471824,
      isoTime: '2022-08-08T23:31:11.824Z',
      eventType: 'run',
      user: 'Chris Preston',
      note: 'Increased mission timout.  Still going to NN1-E',
      data: 'sched asap "load Science/profile_station.xml;set profile_station.MissionTimeout 16 h;set profile_station.NeedCommsTime 60 min;set profile_station.Lat 43.907447 degree;set profile_station.Lon -86.52055 degree" o1bz 1 2\nsched asap "set profile_station.YoYoMaxDepth 20 m;run" o1bz 2 2',
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
  const query = useRecentRuns({ vehicles: ['sim'], from: '2022-08-01' })

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

    await waitFor(() => {
      return screen.getByTestId('command0')
    })

    expect(screen.getByTestId('command0')).toHaveTextContent(
      'Science/profile_station.xml'
    )
    expect(screen.getByTestId('command1')).toHaveTextContent(
      'Science/profile_station.tl'
    )
  })
})
