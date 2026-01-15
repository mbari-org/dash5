import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getPlatformPositions,
  GetPlatformPositionsParams,
} from './getPlatformPositions'

const mockResponse = {
  platformId: '54065b5560d0e168c88d4012',
  platformName: 'm2',
  positions: [
    {
      timeMs: 1609459200000,
      lat: 36.8,
      lon: -122.0,
    },
    {
      timeMs: 1609459260000,
      lat: 36.801,
      lon: -122.001,
    },
    {
      timeMs: 1609459320000,
      lat: 36.802,
      lon: -122.002,
    },
  ],
}

const server = setupServer(
  rest.get('/trackdb/platforms/:platformId/positions', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getPlatformPositions', () => {
  it('should return the mocked response when successful', async () => {
    const params: GetPlatformPositionsParams = {
      platformId: '54065b5560d0e168c88d4012',
    }
    const response = await getPlatformPositions(params)
    expect(response).toEqual(mockResponse)
  })

  it('should include query parameters when provided', async () => {
    const params: GetPlatformPositionsParams = {
      platformId: '54065b5560d0e168c88d4012',
      lastNumberOfFixes: 100,
      startDate: '2021-01-01T00:00:00Z',
      endDate: '2021-01-02T00:00:00Z',
    }

    let capturedParams: any = null
    server.use(
      rest.get('/trackdb/platforms/:platformId/positions', (req, res, ctx) => {
        capturedParams = req.url.searchParams
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )

    await getPlatformPositions(params)
    expect(capturedParams.get('lastNumberOfFixes')).toBe('100')
    expect(capturedParams.get('startDate')).toBe('2021-01-01T00:00:00Z')
    expect(capturedParams.get('endDate')).toBe('2021-01-02T00:00:00Z')
  })

  it('should not include undefined query parameters', async () => {
    const params: GetPlatformPositionsParams = {
      platformId: '54065b5560d0e168c88d4012',
    }

    let capturedParams: any = null
    server.use(
      rest.get('/trackdb/platforms/:platformId/positions', (req, res, ctx) => {
        capturedParams = req.url.searchParams
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )

    await getPlatformPositions(params)
    expect(capturedParams.get('lastNumberOfFixes')).toBeNull()
    expect(capturedParams.get('startDate')).toBeNull()
    expect(capturedParams.get('endDate')).toBeNull()
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/trackdb/platforms/:platformId/positions', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    const params: GetPlatformPositionsParams = {
      platformId: '54065b5560d0e168c88d4012',
    }

    try {
      await getPlatformPositions(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
