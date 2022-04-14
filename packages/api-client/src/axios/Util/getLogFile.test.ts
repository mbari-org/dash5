import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getLogFile, GetLogFileParams } from './getLogFile'

let params: GetLogFileParams = {
  logfilePath: 'example',
  tail: 1,
}

const mockResponse = { data: 'some-data' }
const server = setupServer(
  rest.get(`/util/logger/file/${params.logfilePath}`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getLogFile', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked data when successful', async () => {
    const { data } = await getLogFile(params)
    expect(data).toEqual(mockResponse.data)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get(`/util/logger/file/${params.logfilePath}`, (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getLogFile(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
