import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getVPos, GetVPosParams } from './getVPos'

let params: GetVPosParams = {
  vehicle: 'test vehicle',
  to: 'test destination',
  from: 'test departure',
  limit: 1,
}

const mockResponse = {
  gpsFixes: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'string',
      text: 'string',
    },
  ],
  argoReceives: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'string',
      text: 'string',
    },
  ],
  emergencies: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'string',
      text: 'string',
    },
  ],
  reachedWaypoints: [
    {
      eventId: 'string',
      unixTime: 0,
      isoTime: 'string',
      latitude: 0,
      longitude: 0,
      component: 'string',
      note: 'string',
      text: 'string',
    },
  ],
}

const server = setupServer(
  rest.get('/vpos', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getVPos', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getVPos(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/vpos', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getVPos(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
