import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { alterDeployment, AlterDeploymentParams } from './alterDeployment'

let params: AlterDeploymentParams = {
  deploymentId: 'example',
  date: 'example',
  note: 'example',
  deploymentType: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post(`/deployments/${params.deploymentType}`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('alterDeployment', () => {
  it('should return the mocked value when successful', async () => {
    const response = await alterDeployment(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post(`/deployments/${params.deploymentType}`, (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await alterDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
