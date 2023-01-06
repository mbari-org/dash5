import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getCommandStatus, GetCommandStatusParams } from './getCommandStatus'

let params: GetCommandStatusParams = {
  deploymentId: 1,
}

const mockResponse = {
  result: {
    deploymentInfo: {
      deploymentId: 3000435,
      vehicleName: 'daphne',
      name: 'Daphne 121 MBTS',
      path: '2022-10-07',
      startEvent: { unixTime: 1670629655246, state: 1, eventId: 17391793 },
      launchEvent: {
        unixTime: 1670859940094,
        eventId: 17393099,
        note: 'Vehicle in water',
      },
    },
    eventTypes: 'run,command',
    commandStatuses: [
      {
        event: {
          eventId: 17393307,
          vehicleName: 'daphne',
          unixTime: 1670869180650,
          isoTime: '2022-12-12T18:19:40.650Z',
          eventType: 'command',
          user: 'Brent Jones',
          data: 'configSet VerticalControl.massDefault -16 millimeter persist',
          text: 'configSet VerticalControl.massDefault -16 millimeter persist',
        },
        status: 'TBD',
        relatedEvents: [],
      },
      {
        event: {
          eventId: 17393305,
          vehicleName: 'daphne',
          unixTime: 1670869134173,
          isoTime: '2022-12-12T18:18:54.173Z',
          eventType: 'command',
          user: 'Brent Jones',
          data: 'configSet VerticalControl.buoyancyNeutral 407 cubic_centimeter persist',
          text: 'configSet VerticalControl.buoyancyNeutral 407 cubic_centimeter persist',
        },
        status: 'TBD',
        relatedEvents: [],
      },
      {
        event: {
          eventId: 17393277,
          vehicleName: 'daphne',
          unixTime: 1670867997572,
          isoTime: '2022-12-12T17:59:57.572Z',
          eventType: 'run',
          user: 'Brent Jones',
          data: 'run Science/mbts_sci2.tl',
        },
        status: 'TBD',
        relatedEvents: [],
      },
      {
        event: {
          eventId: 17393176,
          vehicleName: 'daphne',
          unixTime: 1670861207048,
          isoTime: '2022-12-12T16:06:47.048Z',
          eventType: 'run',
          user: 'Brent Jones',
          data: 'run Maintenance/ballast_and_trim.tl',
        },
        status: 'TBD',
        relatedEvents: [],
      },
      {
        event: {
          eventId: 17393115,
          vehicleName: 'daphne',
          unixTime: 1670860094538,
          isoTime: '2022-12-12T15:48:14.538Z',
          eventType: 'run',
          user: 'Brent Jones',
          data: 'run Maintenance/calibrate_sparton_compass.tl',
        },
        status: 'TBD',
        relatedEvents: [],
      },
      {
        event: {
          eventId: 17393098,
          vehicleName: 'daphne',
          unixTime: 1670859944580,
          isoTime: '2022-12-12T15:45:44.580Z',
          eventType: 'command',
          user: 'Chris Wahl',
          note: 'Vehicle in water',
          data: 'restart logs',
          text: 'restart logs',
        },
        status: 'TBD',
        relatedEvents: [],
      },
      {
        event: {
          eventId: 17392897,
          vehicleName: 'daphne',
          unixTime: 1670856006037,
          isoTime: '2022-12-12T14:40:06.037Z',
          eventType: 'command',
          user: 'Brett Hobson',
          note: 'test',
          data: 'ibit',
          text: 'ibit',
        },
        status: 'TBD',
        relatedEvents: [],
      },
    ],
  },
}

const server = setupServer(
  rest.get('/deployments/commandStatus', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getCommandStatus', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getCommandStatus(params)
    expect(response).toEqual({
      ...mockResponse.result,
      eventTypes: mockResponse.result.eventTypes.split(','),
    })
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/deployments/commandStatus', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getCommandStatus(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
