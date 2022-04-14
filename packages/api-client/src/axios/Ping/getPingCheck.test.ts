import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getPingCheck, GetPingCheckParams } from './getPingCheck'

let params: GetPingCheckParams = {
  vehicleName: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/ping/check', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getPingCheck', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getPingCheck(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/ping/check', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getPingCheck(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
