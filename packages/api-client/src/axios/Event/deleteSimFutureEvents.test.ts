import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  deleteSimFutureEvents,
  DeleteSimFutureEventsParams,
} from './deleteSimFutureEvents'

let params: DeleteSimFutureEventsParams = {}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.delete('/events/future', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteSimFutureEvents', () => {
  it('should return the mocked value when successful', async () => {
    const response = await deleteSimFutureEvents(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete('/events/future', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await deleteSimFutureEvents(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
