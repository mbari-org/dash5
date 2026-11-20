import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getCommandQueue } from './getCommandQueue'

const mockResponse = {
  result: {
    sim: [
      {
        refEventId: 12345,
        via: { medium: 'cellsat', timeout: 60 },
        queuedTimeMillis: 1700000000000,
        dispatched: false,
      },
      {
        refEventId: 12346,
        via: { medium: 'cellsat', timeout: 60 },
        queuedTimeMillis: 1700000010000,
        dispatched: true,
        servedTimeMillis: 1700000015000,
      },
    ],
  },
}

const server = setupServer(
  rest.get('/commands/queue', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getCommandQueue', () => {
  it('should return queue entries keyed by vehicle name', async () => {
    const response = await getCommandQueue({ vehicles: 'sim' })
    expect(response).toEqual(mockResponse.result)
    expect(response['sim']).toHaveLength(2)
    expect(response['sim'][0].dispatched).toBe(false)
    expect(response['sim'][1].dispatched).toBe(true)
  })

  it('should include the vehicles param in the request', async () => {
    let capturedVehicles: string | null = null
    server.use(
      rest.get('/commands/queue', (req, res, ctx) => {
        capturedVehicles = req.url.searchParams.get('vehicles')
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )
    await getCommandQueue({ vehicles: 'sim' })
    expect(capturedVehicles).toBe('sim')
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/queue', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )
    await expect(getCommandQueue({ vehicles: 'sim' })).rejects.toBeDefined()
  })
})
