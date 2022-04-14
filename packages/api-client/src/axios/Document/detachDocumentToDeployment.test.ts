import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { detachDocumentToDeployment, DetachDocumentToDeploymentParams } from './detachDocumentToDeployment'

let params: DetachDocumentToDeploymentParams = {
  docId: "example",
  deploymentId: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.delete("/documents/deployment", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('detachDocumentToDeployment', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await detachDocumentToDeployment(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete("/documents/deployment", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await detachDocumentToDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
