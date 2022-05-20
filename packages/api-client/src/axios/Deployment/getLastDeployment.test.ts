import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getLastDeployment, GetLastDeploymentParams } from './getLastDeployment'

let params: GetLastDeploymentParams = {
  vehicle: 'opah',
  to: 'example',
}

const mockResponse = {
  result: {
    active: false,
    lastEvent: 1523223120000,
    deploymentId: 3000143,
    vehicleName: 'opah',
    name: 'Opah 12 - Falkor Leg 2',
    path: '2018-03-26',
    startEvent: {
      unixTime: 1522984980000,
      state: 1,
      eventId: 8233840,
    },
    launchEvent: {
      unixTime: 1523028360000,
      eventId: 8234797,
      note: 'Vehicle in water.',
    },
    recoverEvent: {
      unixTime: 1523222000000,
      eventId: 8235564,
      note: 'Vehicle recovered.',
    },
    dlistResult: {
      path: '/opt/tethysdash/data/opah/missionlogs/2018/20180405_20180408.dlist',
      messages: ['File not found'],
    },
    endEvent: {
      unixTime: 1523223120000,
      state: 0,
      eventId: 8235594,
    },
  },
}

const server = setupServer(
  rest.get('/deployments/last', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getLastDeployment', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getLastDeployment(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/deployments/last', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getLastDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
