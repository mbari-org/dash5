import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getDocumentInstance, GetDocumentInstanceParams } from './getDocumentInstance'

let params: GetDocumentInstanceParams = {
  docInstanceId: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get("/documents/instance", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDocumentInstance', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getDocumentInstance(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get("/documents/instance", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getDocumentInstance(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
