import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getMissionStartedEvent,
  GetMissionStartedEventParams,
} from './getMissionStartedEvent'

let params: GetMissionStartedEventParams = {
  vehicle: 'example',
  to: 'example',
  limit: 1,
}

const mockResponse = {
  result: [
    {
      eventId: 0,
      eventType: 'argoReceive',
      vehicleName: 'string',
      unixTime: 0,
      isoTime: 'string',
      fix: {
        latitude: 0,
        longitude: 0,
      },
      state: 0,
      dataLen: 0,
      refId: 0,
      index: 0,
      component: 'string',
    },
  ],
}

const server = setupServer(
  rest.get('/events/mission-started', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getMissionStartedEvent', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getMissionStartedEvent(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/events/mission-started', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getMissionStartedEvent(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
