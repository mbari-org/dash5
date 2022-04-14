import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { attachDocumentToVehicle, AttachDocumentToVehicleParams } from './attachDocumentToVehicle'

let params: AttachDocumentToVehicleParams = {
  docId: "example",
  vehicleName: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post("/documents/vehicle", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('attachDocumentToVehicle', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await attachDocumentToVehicle(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post("/documents/vehicle", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await attachDocumentToVehicle(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
