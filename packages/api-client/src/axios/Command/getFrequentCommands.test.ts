import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getFrequentCommands,
  GetFrequentCommandsParams,
} from './getFrequentCommands'

let params: GetFrequentCommandsParams = {
  vehicleName: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/commands/frequent', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getFrequentCommands', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getFrequentCommands(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/frequent', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getFrequentCommands(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
