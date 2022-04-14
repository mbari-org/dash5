import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { attachDocumentToDeployment, AttachDocumentToDeploymentParams } from './attachDocumentToDeployment'

let params: AttachDocumentToDeploymentParams = {
  docId: "example",
  deploymentId: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post("/documents/deployment", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('attachDocumentToDeployment', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await attachDocumentToDeployment(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post("/documents/deployment", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await attachDocumentToDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
