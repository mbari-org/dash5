import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { endDeployment, EndDeploymentParams } from './endDeployment'

let params: EndDeploymentParams = {
  deploymentId: 'example',
  date: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/deployments/end', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('endDeployment', () => {
  it('should return the mocked value when successful', async () => {
    const response = await endDeployment(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/deployments/end', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await endDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
