import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getTileLayers } from './getTileLayers'

export const mockTileLayers = [
  {
    name: 'SST 1 Day Composite',
    urlTemplate: 'https://example.com/wms',
    wms: true,
    options: {
      layers: 'sst_1day',
      format: 'image/png',
      transparent: 'true',
      opacity: 0.8,
    },
  },
  {
    name: 'Cell phone coverage map',
    urlTemplate: 'https://tiles.example.com/{z}/{x}/{y}.png',
    wms: false,
    options: { attribution: 'Coverage &copy; Example', maxZoom: 18 },
  },
]

const server = setupServer(
  rest.get('/info/map/tileLayers', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: mockTileLayers }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getTileLayers', () => {
  it('should unwrap the { result } envelope and return the tile layer array', async () => {
    const response = await getTileLayers()
    expect(response).toEqual(mockTileLayers)
  })

  it('should return the correct layer names', async () => {
    const response = await getTileLayers()
    expect(response.map((t) => t.name)).toEqual([
      'SST 1 Day Composite',
      'Cell phone coverage map',
    ])
  })

  it('should throw when the server returns an error', async () => {
    server.use(
      rest.get('/info/map/tileLayers', (_req, res, ctx) =>
        res.once(ctx.status(500))
      )
    )
    await expect(getTileLayers()).rejects.toBeDefined()
  })
})
