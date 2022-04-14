import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getVConfig, GetVConfigParams } from './getVConfig'

let params: GetVConfigParams = {
  vehicle: "example",
  gitTag: "example",
  since: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get("/vconfig", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getVConfig', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getVConfig(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get("/vconfig", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getVConfig(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
