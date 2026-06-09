import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getDepthData, GetDepthDataResponse } from './getDepthData'

const mockResponse: GetDepthDataResponse = {
  times: [1_700_000_000_000, 1_700_000_060_000],
  values: [10.5, 25.0],
}

let lastRequest: { url: URL } | null = null

const server = setupServer(
  rest.get('/data/depth', (req, res, ctx) => {
    lastRequest = { url: req.url }
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
beforeEach(() => {
  lastRequest = null
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDepthData', () => {
  it('returns the mocked response', async () => {
    const result = await getDepthData({
      vehicle: 'brizo',
      from: 1_699_971_200_000,
    })
    expect(result).toEqual(mockResponse)
  })

  it('encodes vehicle name via URLSearchParams', async () => {
    await getDepthData({ vehicle: 'my vehicle', from: 1_699_971_200_000 })
    expect(lastRequest?.url.searchParams.get('vehicle')).toBe('my vehicle')
  })

  it('passes from and maxlen as query params', async () => {
    const from = 1_699_971_200_000
    const maxlen = 500
    await getDepthData({ vehicle: 'brizo', from, maxlen })
    expect(lastRequest?.url.searchParams.get('from')).toBe(String(from))
    expect(lastRequest?.url.searchParams.get('maxlen')).toBe(String(maxlen))
  })

  it('uses default maxlen of 2000 when not specified', async () => {
    await getDepthData({ vehicle: 'brizo', from: 1_699_971_200_000 })
    expect(lastRequest?.url.searchParams.get('maxlen')).toBe('2000')
  })

  it('throws on a non-200 response', async () => {
    server.use(
      rest.get('/data/depth', (_req, res, ctx) => res.once(ctx.status(500)))
    )
    await expect(
      getDepthData({ vehicle: 'brizo', from: 1_699_971_200_000 })
    ).rejects.toBeDefined()
  })
})
