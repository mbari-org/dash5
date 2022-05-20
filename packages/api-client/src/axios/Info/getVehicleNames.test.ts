import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getVehicleNames, GetVehicleNamesParams } from './getVehicleNames'

let params: GetVehicleNamesParams = {
  refresh: 'y',
}

const mockResponse = {
  result: [
    'ahi',
    'aku',
    'brizo',
    'daphne',
    'galene',
    'makai',
    'melia',
    'mesobot',
    'opah',
    'pallas',
    'polaris',
    'pontus',
    'proxima',
    'pyxis',
    'sim',
    'stella',
    'tethys',
    'triton',
  ],
}

const server = setupServer(
  rest.get('/info/vehicleNames', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getVehicleNames', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getVehicleNames(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/vehicleNames', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getVehicleNames(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
