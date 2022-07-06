import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getEvents, GetEventsParams } from './getEvents'

let params: GetEventsParams = {
  vehicles: ['example'],
  from: 'example',
  to: 'example',
  eventTypes: ['note', 'gpsFix'],
  limit: 1,
  noteMatches: 'example',
}

export const mockResponse = {
  result: [
    {
      eventId: 16932998,
      vehicleName: 'pontus',
      unixTime: 1656436678089,
      isoTime: '2022-06-28T17:17:58.089Z',
      eventType: 'note',
      state: 0,
      user: 'Brett Hobson',
      note: 'was going to skip the B&T and compass cal in an effort to get the show on the road.  Thanks for the help though',
    },
    {
      eventId: 16932853,
      vehicleName: 'pontus',
      unixTime: 1656435451959,
      isoTime: '2022-06-28T16:57:31.959Z',
      eventType: 'note',
      state: 0,
      user: 'Brian Kieft',
      note: 'Signing in as PIC',
    },
  ],
}

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
    expect(response).toEqual(mockResponse.result)
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
