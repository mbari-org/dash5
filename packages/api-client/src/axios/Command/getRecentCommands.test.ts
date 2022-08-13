import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getRecentCommands, GetRecentCommandsParams } from './getRecentCommands'

let params: GetRecentCommandsParams = {
  vehicleName: 'example',
}

const mockResponse = {
  result: [
    {
      eventId: 17098211,
      vehicleName: 'brizo',
      unixTime: 1660084789730,
      isoTime: '2022-08-09T22:39:49.730Z',
      eventType: 'command',
      user: 'Brian Kieft',
      data: 'restart hardware',
      text: 'restart hardware',
    },
    {
      eventId: 17098049,
      vehicleName: 'brizo',
      unixTime: 1660082686356,
      isoTime: '2022-08-09T22:04:46.356Z',
      eventType: 'command',
      user: 'Brian Kieft',
      data: 'restart sys',
      text: 'restart sys',
    },
    {
      eventId: 17097960,
      vehicleName: 'brizo',
      unixTime: 1660081227071,
      isoTime: '2022-08-09T21:40:27.071Z',
      eventType: 'command',
      user: 'Brian Kieft',
      data: 'get platform_buoyancy_position',
      text: 'get platform_buoyancy_position',
    },
    {
      eventId: 17097930,
      vehicleName: 'brizo',
      unixTime: 1660080787736,
      isoTime: '2022-08-09T21:33:07.736Z',
      eventType: 'command',
      user: 'Brian Kieft',
      data: 'get platfrom_buoyancy_position',
      text: 'get platfrom_buoyancy_position',
    },
  ],
}

const server = setupServer(
  rest.get('/commands/recent', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getRecentCommands', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getRecentCommands(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/recent', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getRecentCommands(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
