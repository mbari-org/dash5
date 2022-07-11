import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CommsSection from './CommsSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from './testHelpers'

export const mockResponse = {
  result: [
    {
      eventId: 16824954,
      vehicleName: 'makai',
      unixTime: 1653422230162,
      isoTime: '2022-05-24T19:57:10.162Z',
      eventType: 'command',
      user: 'Brian Kieft',
      data: 'restart app',
      text: 'restart app',
    },
    {
      eventId: 16823998,
      vehicleName: 'makai',
      unixTime: 1653411440364,
      isoTime: '2022-05-24T16:57:20.364Z',
      eventType: 'run',
      user: 'Another Pilot',
      data: 'run Engineering/joystick_backseat.xml',
    },
    {
      eventId: 16823941,
      vehicleName: 'makai',
      unixTime: 1653410441775,
      isoTime: '2022-05-24T16:40:41.775Z',
      eventType: 'command',
      user: 'One More Pilot',
      data: '! testCommand > echo 1 > /dev/loadC4',
      text: '! testCommand > echo 1 > /dev/loadC4',
    },
    {
      eventId: 16823872,
      vehicleName: 'makai',
      unixTime: 1653408316937,
      isoTime: '2022-05-24T16:05:16.937Z',
      eventType: 'command',
      user: 'Pilot McPilotface',
      note: 'Is it time for a backseat driver? I think it is.',
      data: '! echo 1 > /dev/loadC4',
      text: '! echo 1 > /dev/loadC4',
    },
    {
      eventId: 16823823,
      vehicleName: 'makai',
      unixTime: 1653407396751,
      isoTime: '2022-05-24T15:49:56.751Z',
      eventType: 'run',
      user: 'LRAUV Pilot',
      data: 'sched asap "load Science/sci2_flat_and_level.xml;set sci2_flat_and_level.MissionTimeout 2 h;set sci2_flat_and_level.NeedCommsTime 18 min;set sci2_flat_and_level.Depth 2 m;set sci2_flat_and_level.Lat1 34.409 degree" 1vvz8 1 3\nsched asap "set sci2_flat_and_level.Lon1 -119.822 degree;set sci2_flat_and_level.Speed 1.15 m/s;set sci2_flat_and_level.ApproachDepth 1.5 m;set sci2_flat_and_level.ApproachSpeed 1.15 m/s;set sci2_flat_and_level.ApproachPitchLimit 10 degree" 1vvz8 2 3\nsched asap "set sci2_flat_and_level.ApproachDepthTimeout 15 min;set sci2_flat_and_level.ApproachSettleTimePreDive 1 min;set sci2_flat_and_level.MaxDepth 50 m;set sci2_flat_and_level.MinOffshore 1 km;run" 1vvz8 3 3',
    },
    {
      eventId: 16823809,
      vehicleName: 'makai',
      unixTime: 1653406147243,
      isoTime: '2022-05-24T15:29:07.243Z',
      eventType: 'command',
      user: 'Simulator Pilot',
      data: 'stop',
      text: 'stop',
    },
    {
      eventId: 16823694,
      vehicleName: 'makai',
      unixTime: 1653398760397,
      isoTime: '2022-05-24T13:26:00.397Z',
      eventType: 'run',
      user: 'Chris Preston',
      note: 'Go to Outbound wtp (34.397, -119.80) and profile station till pickup.',
      data: 'sched asap "load Science/profile_station.xml;set profile_station.NeedCommsTime 30 min;set profile_station.Lat 34.397 degree;set profile_station.Lon -119.8 degree;set profile_station.Radius 100 m;set profile_station.YoYoMaxDepth 25 m" 1vpbc 1 2\nsched asap "set profile_station.MaxDepth 30 m;run" 1vpbc 2 2',
    },
  ],
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('VehicleList', () => {
  test('should render the component', async () => {
    expect(() =>
      render(
        <MockProviders queryClient={new QueryClient()}>
          <CommsSection vehicleName="makai" from="" />
        </MockProviders>
      )
    ).not.toThrow()
  })

  test('should render the pilot name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <CommsSection vehicleName="makai" from="" />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/One More/i)
    })
    expect(screen.getByText(/One More/i)).toBeInTheDocument()
  })

  test('should render the command', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <CommsSection vehicleName="makai" from="" />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/testCommand/i)
    })
    expect(screen.getByText(/testCommand/i)).toBeInTheDocument()
    expect(screen.getByText(/testCommand/i).closest('li')).toHaveClass(
      'text-green-600'
    )
  })

  test('should render the scheduled task', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <CommsSection vehicleName="makai" from="" />
      </MockProviders>
    )
    await waitFor(() => {
      screen.getByText(/sci2_flat_and_level/i)
    })
    expect(screen.getByText(/sci2_flat_and_level/i)).toBeInTheDocument()
    expect(screen.getByText(/sci2_flat_and_level/i).closest('li')).toHaveClass(
      'text-indigo-600'
    )
  })
})
