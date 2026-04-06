import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getKmlLayers } from './getKmlLayers'

export const mockKmlLayers = [
  { name: 'Untitled_Polygon.kml', path: '/kml/Untitled_Polygon.kml' },
  {
    name: 'Lake Erie survey',
    path: '/kml/t1.21217.1616.LakeErie.143.250m.kml',
  },
  { name: 'Archive overlay', path: '/kml/archive.kmz' },
]

const server = setupServer(
  rest.get('/info/map/kmlLayers', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: mockKmlLayers }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getKmlLayers', () => {
  it('should unwrap the { result } envelope and return the KML layer list', async () => {
    const response = await getKmlLayers()
    expect(response).toEqual(mockKmlLayers)
  })

  it('should include both .kml and .kmz entries', async () => {
    const response = await getKmlLayers()
    expect(response.some((k) => k.path.endsWith('.kml'))).toBe(true)
    expect(response.some((k) => k.path.endsWith('.kmz'))).toBe(true)
  })

  it('should throw when the server returns an error', async () => {
    server.use(
      rest.get('/info/map/kmlLayers', (_req, res, ctx) =>
        res.once(ctx.status(500))
      )
    )
    await expect(getKmlLayers()).rejects.toBeDefined()
  })
})
