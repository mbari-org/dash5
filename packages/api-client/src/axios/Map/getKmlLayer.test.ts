import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getKmlLayer } from './getKmlLayer'

const RAW_KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark><name>Test</name></Placemark>
</kml>`

const server = setupServer(
  rest.get('/info/map/kmlLayer', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: RAW_KML }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getKmlLayer', () => {
  it('should unwrap { result: string } and return the raw KML string', async () => {
    const response = await getKmlLayer({ path: '/kml/test.kml' })
    expect(response).toBe(RAW_KML)
  })

  it('should return a raw string response directly when the server omits the envelope', async () => {
    server.use(
      rest.get('/info/map/kmlLayer', (_req, res, ctx) =>
        res.once(ctx.status(200), ctx.text(RAW_KML))
      )
    )
    const response = await getKmlLayer({ path: '/kml/test.kml' })
    expect(response).toBe(RAW_KML)
  })

  it('should throw for unexpected response shapes', async () => {
    server.use(
      rest.get('/info/map/kmlLayer', (_req, res, ctx) =>
        res.once(ctx.status(200), ctx.json({ unexpected: true }))
      )
    )
    try {
      await getKmlLayer({ path: '/kml/test.kml' })
    } catch (error) {
      expect((error as Error).message).toMatch('Unexpected response format')
    }
  })

  it('should throw when the server returns an error', async () => {
    server.use(
      rest.get('/info/map/kmlLayer', (_req, res, ctx) =>
        res.once(ctx.status(500))
      )
    )
    try {
      await getKmlLayer({ path: '/kml/test.kml' })
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
