import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getPolygons } from './getPolygons'

export const mockResponse = [
  {
    name: 'US Shipping Lanes',
    geojson: {
      type: 'FeatureCollection',
      name: 'US Shipping Lanes',
      properties: { color: '#3388ff' },
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-120, 35],
                [-118, 35],
                [-118, 37],
                [-120, 37],
                [-120, 35],
              ],
            ],
          },
        },
      ],
    },
  },
]

const server = setupServer(
  rest.get('/map/layers/polygons', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getPolygons', () => {
  it('should return the mocked array of polygons', async () => {
    const response = await getPolygons()
    expect(response).toEqual(mockResponse)
  })

  it('should return the polygon name and geojson shape', async () => {
    const response = await getPolygons()
    expect(response[0].name).toBe('US Shipping Lanes')
    expect(response[0].geojson.features).toHaveLength(1)
  })

  it('should throw when the server returns an error', async () => {
    server.use(
      rest.get('/map/layers/polygons', (_req, res, ctx) =>
        res.once(ctx.status(500))
      )
    )
    try {
      await getPolygons()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
