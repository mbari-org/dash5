import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getVehicles, GetVehiclesParams } from './getVehicles'

let params: GetVehiclesParams = {}

const mockResponse = {
  result: [
    { vehicleName: 'ahi', color: '#FF9900' },
    { vehicleName: 'aku', color: '#CC33FF' },
    { vehicleName: 'brizo', color: '#f4ba0c' },
    { vehicleName: 'daphne', color: '#FF9900' },
    { vehicleName: 'galene', color: '#CC33FF' },
    { vehicleName: 'makai', color: '#FF0000' },
    { vehicleName: 'melia', color: '#FF0000' },
    { vehicleName: 'mesobot', color: '#FF0000' },
    { vehicleName: 'opah', color: '#CC33FF' },
    { vehicleName: 'polaris', color: '#FF0000' },
    { vehicleName: 'pontus', color: '#BD9782' },
    { vehicleName: 'sim', color: '#FF0000' },
    { vehicleName: 'stella', color: '#FF0000' },
    { vehicleName: 'tethys', color: '#CC33FF' },
    { vehicleName: 'triton', color: '#f4ba0c' },
  ],
}

const server = setupServer(
  rest.get('/info/vehicles', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getVehicles', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getVehicles(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/info/vehicles', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getVehicles(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
