import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getVariableData, GetVariableDataResponse } from './getVariableData'

const mockResponse: GetVariableDataResponse = {
  name: 'depth',
  units: 'm',
  times: [1_780_000_000_000, 1_780_000_060_000],
  values: [9.4, 10.1],
}

let lastRequest: { url: URL } | null = null

const server = setupServer(
  rest.get('/data/:variableName', (req, res, ctx) => {
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

describe('getVariableData', () => {
  it('returns the mocked response', async () => {
    const result = await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
    })
    expect(result).toEqual(mockResponse)
  })

  it('URL-encodes the variable name in the path', async () => {
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'some variable',
      from: 1_780_000_000_000,
    })
    expect(lastRequest?.url.pathname).toContain('some%20variable')
  })

  it('passes vehicle and from as query params, and omits maxlen by default', async () => {
    const from = 1_780_000_000_000
    await getVariableData({ vehicle: 'brizo', variableName: 'depth', from })
    expect(lastRequest?.url.searchParams.get('vehicle')).toBe('brizo')
    expect(lastRequest?.url.searchParams.get('from')).toBe(String(from))
    expect(lastRequest?.url.searchParams.get('maxlen')).toBeNull()
  })

  it('passes to when provided', async () => {
    const from = 1_780_000_000_000
    const to = 1_780_100_000_000
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from,
      to,
    })
    expect(lastRequest?.url.searchParams.get('to')).toBe(String(to))
  })

  it('omits to when not provided', async () => {
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
    })
    expect(lastRequest?.url.searchParams.get('to')).toBeNull()
  })

  it('uses a custom maxlen when specified', async () => {
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
      maxlen: 500,
    })
    expect(lastRequest?.url.searchParams.get('maxlen')).toBe('500')
  })

  it('passes step as a query param when specified', async () => {
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
      step: 130,
    })
    expect(lastRequest?.url.searchParams.get('step')).toBe('130')
    expect(lastRequest?.url.searchParams.get('maxlen')).toBeNull()
  })

  it('prefers step over maxlen when both are provided', async () => {
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
      step: 130,
      maxlen: 500,
    })
    expect(lastRequest?.url.searchParams.get('step')).toBe('130')
    expect(lastRequest?.url.searchParams.get('maxlen')).toBeNull()
  })

  it('omits both step and maxlen by default', async () => {
    await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
    })
    expect(lastRequest?.url.searchParams.get('step')).toBeNull()
    expect(lastRequest?.url.searchParams.get('maxlen')).toBeNull()
  })

  it('returns null on a 404 (variable has no data in the time window)', async () => {
    server.use(
      rest.get('/data/:variableName', (_req, res, ctx) =>
        res.once(ctx.status(404))
      )
    )
    const result = await getVariableData({
      vehicle: 'brizo',
      variableName: 'depth',
      from: 1_780_000_000_000,
    })
    expect(result).toBeNull()
  })

  it('throws on a non-200, non-404 response', async () => {
    server.use(
      rest.get('/data/:variableName', (_req, res, ctx) =>
        res.once(ctx.status(500))
      )
    )
    await expect(
      getVariableData({
        vehicle: 'brizo',
        variableName: 'depth',
        from: 1_780_000_000_000,
      })
    ).rejects.toBeDefined()
  })
})
