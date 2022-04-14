import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getDeployments, GetDeploymentsParams } from './getDeployments'

let params: GetDeploymentsParams = {
  vehicleName: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/deployments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...mockResponse,
        vehicleName: req.url.searchParams.get('vehicleName'),
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDeployments', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getDeployments(params)
    expect(response).toEqual({ ...mockResponse, ...params })
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/deployments', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getDeployments(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
