import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { startDeployment, StartDeploymentParams } from './startDeployment'

let params: StartDeploymentParams = {
  vehicle: 'example',
  name: 'example',
  tag: 'example',
  date: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/deployments/start', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('startDeployment', () => {
  it('should return the mocked value when successful', async () => {
    const response = await startDeployment(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/deployments/start', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await startDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
