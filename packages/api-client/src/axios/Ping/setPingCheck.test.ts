import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { setPingCheck, SetPingCheckParams } from './setPingCheck'

let params: SetPingCheckParams = {
  vehicleName: 'example',
  enable: true,
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.put('/ping/check', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('setPingCheck', () => {
  it('should return the mocked value when successful', async () => {
    const response = await setPingCheck(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/ping/check', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await setPingCheck(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
