import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getEvents, GetEventsParams } from './getEvents'

let params: GetEventsParams = {
  vehicles: 'example',
  from: 'example',
  to: 'example',
  eventTypes: 'example',
  limit: 1,
  noteMatches: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getEvents', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getEvents(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/events', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getEvents(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
