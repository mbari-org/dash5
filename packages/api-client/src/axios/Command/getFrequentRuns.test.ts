import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getFrequentRuns, GetFrequentRunsParams } from './getFrequentRuns'

let params: GetFrequentRunsParams = {
  vehicle: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get("/commands/frequent/runs", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getFrequentRuns', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getFrequentRuns(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get("/commands/frequent/runs", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getFrequentRuns(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
