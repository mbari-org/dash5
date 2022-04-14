import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  detachDocumentToVehicle,
  DetachDocumentToVehicleParams,
} from './detachDocumentToVehicle'

let params: DetachDocumentToVehicleParams = {
  docId: 'example',
  vehicleName: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.delete('/documents/vehicle', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('detachDocumentToVehicle', () => {
  it('should return the mocked value when successful', async () => {
    const response = await detachDocumentToVehicle(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete('/documents/vehicle', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await detachDocumentToVehicle(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
