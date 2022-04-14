import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { updateLogger, UpdateLoggerParams } from './updateLogger'

let params: UpdateLoggerParams = {
  name: 'example',
  level: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.put('/util/logger', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('updateLogger', () => {
  it('should return the mocked value when successful', async () => {
    const response = await updateLogger(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/util/logger', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await updateLogger(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
