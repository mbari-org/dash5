import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getDeployments, GetDeploymentsParams } from './getDeployments'

let params: GetDeploymentsParams = {
  vehicleName: 'example',
}

const mockResponse = {
  result: [
    {
      deploymentId: 3000403,
      vehicleName: 'pontus',
      name: 'Pontus 24FishCAM',
      path: '2022-06-07',
      startEvent: { unixTime: 1656368134464, state: 1, eventId: 16926582 },
    },
    {
      deploymentId: 3000402,
      vehicleName: 'sim',
      name: 'testing tethysl again',
      path: '2022-06-21',
      startEvent: { unixTime: 1655854978299, state: 1, eventId: 16895057 },
      endEvent: { unixTime: 1655932918662, state: 0, eventId: 16896390 },
    },
    {
      deploymentId: 3000401,
      vehicleName: 'tethys',
      name: 'Tethys 177 Docking',
      path: '2022-06-21',
      startEvent: { unixTime: 1655830172082, state: 1, eventId: 16894484 },
      endEvent: { unixTime: 1655930304618, state: 0, eventId: 16896330 },
    },
    {
      deploymentId: 3000400,
      vehicleName: 'galene',
      name: 'AyeRIS 6',
      path: '2022-06-09A',
      startEvent: { unixTime: 1654728107274, state: 1, eventId: 16873415 },
      endEvent: { unixTime: 1655318111801, state: 0, eventId: 16891214 },
    },
  ],
}

const server = setupServer(
  rest.get('/deployments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...mockResponse,
        vehicleName: req.url.searchParams.get('vehicleName'),
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDeployments', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getDeployments(params)
    expect(response).toEqual([
      {
        deploymentId: 3000403,
        vehicleName: 'pontus',
        name: 'Pontus 24FishCAM',
        path: '2022-06-07',
        startEvent: { unixTime: 1656368134464, state: 1, eventId: 16926582 },
        active: true,
        present: true,
        lastEvent: 1656368134464,
      },
      {
        deploymentId: 3000402,
        vehicleName: 'sim',
        name: 'testing tethysl again',
        path: '2022-06-21',
        startEvent: { unixTime: 1655854978299, state: 1, eventId: 16895057 },
        endEvent: { unixTime: 1655932918662, state: 0, eventId: 16896390 },
        active: false,
        present: true,
        lastEvent: 1655932918662,
      },
      {
        deploymentId: 3000401,
        vehicleName: 'tethys',
        name: 'Tethys 177 Docking',
        path: '2022-06-21',
        startEvent: { unixTime: 1655830172082, state: 1, eventId: 16894484 },
        endEvent: { unixTime: 1655930304618, state: 0, eventId: 16896330 },
        active: false,
        present: true,
        lastEvent: 1655930304618,
      },
      {
        deploymentId: 3000400,
        vehicleName: 'galene',
        name: 'AyeRIS 6',
        path: '2022-06-09A',
        startEvent: { unixTime: 1654728107274, state: 1, eventId: 16873415 },
        endEvent: { unixTime: 1655318111801, state: 0, eventId: 16891214 },
        active: false,
        present: true,
        lastEvent: 1655318111801,
      },
    ])
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/deployments', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getDeployments(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
