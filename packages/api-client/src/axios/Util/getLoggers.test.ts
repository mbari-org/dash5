import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getLoggers, GetLoggersParams } from './getLoggers'

let params: GetLoggersParams = {}

const mockResponse = { loggers: [] }
const server = setupServer(
  rest.get('/util/logger', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getLoggers', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked loggers when successful', async () => {
    const { loggers } = await getLoggers(params)
    expect(loggers).toEqual(mockResponse.loggers)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/util/logger', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getLoggers(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
