import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getUniversals, GetUniversalsParams } from './getUniversals'

let params: GetUniversalsParams = {}

const mockResponse = { result: ['some-value', 'some-other-value'] }
const server = setupServer(
  rest.get('/commands/universals', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getUniversals', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getUniversals(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/universals', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getUniversals(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
