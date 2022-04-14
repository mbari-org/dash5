import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  generateDeploymentDList,
  GenerateDeploymentDListParams,
} from './generateDeploymentDList'

let params: GenerateDeploymentDListParams = {
  deploymentId: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.put('/deployments/dlist', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('generateDeploymentDList', () => {
  it('should return the mocked value when successful', async () => {
    const response = await generateDeploymentDList(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/deployments/dlist', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await generateDeploymentDList(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
