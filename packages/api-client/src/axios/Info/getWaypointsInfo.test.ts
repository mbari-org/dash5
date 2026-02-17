import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getWaypoints, GetWaypointsParams } from './getWaypointsInfo'

let params: GetWaypointsParams = {
  vehicle: 'test vehicle',
  to: 1740767743191,
}

const mockResponse = {
  result: {
    missionStartedEvent: {
      name: 'mock mission',
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

describe('getWaypoints', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getWaypoints(params)
    expect(response).toEqual({
      ...mockResponse.result,
      vehicleName: params.vehicle,
    })
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/wp', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getWaypoints(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
