import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getStations } from './getStations'

const mockResponse = [
  {
    name: 'Sand_Island: SI-1',
    geojson: {
      type: 'Feature',
      properties: {
        weight: 5,
        color: 'red',
      },
      geometry: {
        type: 'Point',
        coordinates: [-91.0348, 46.96421667],
      },
    },
  },
  {
    name: 'Sand_Island: SI-2',
    geojson: {
      type: 'Feature',
      properties: {
        weight: 5,
        color: 'red',
      },
      geometry: {
        type: 'Point',
        coordinates: [-91.07033333, 46.96416667],
      },
    },
  },
]

const server = setupServer(
  rest.get('/map/layers/stations', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getStations', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getStations()
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/info/map/stations', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getStations()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
