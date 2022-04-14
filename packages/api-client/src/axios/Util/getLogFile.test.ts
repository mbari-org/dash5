import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getLogFile, GetLogFileParams } from './getLogFile'

let params: GetLogFileParams = {
  logfilePath: 'example',
  tail: 1,
}

const mockResponse = { data: 'some-data' }
const server = setupServer(
  rest.get(`/util/logger/file/${params.logfilePath}`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ ...mockResponse, tail: req.url.searchParams.get('tail') })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getLogFile', () => {
  it('should return the mocked data when successful', async () => {
    const { data, tail } = (await getLogFile(params)) as {
      data: string
      tail: string
    }
    expect(data).toEqual(mockResponse.data)
    expect(tail).toEqual(params.tail.toString())
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
