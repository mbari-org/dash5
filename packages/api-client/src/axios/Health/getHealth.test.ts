import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getHealth, GetHealthResponse } from './getHealth'

export const mockResponse: { result: GetHealthResponse } = {
  result: {
    atIso: '2026-06-19T00:00:00Z',
    asyncConnections: 3,
    freeMemory: 512 * 1024 * 1024,
    maxMemory: 2048 * 1024 * 1024,
    totalMemory: 1024 * 1024 * 1024,
    availableProcessors: 8,
    application: 'TethysDash',
    version: '5.0.0',
    build: '1234',
    appInstance: 'okeanids',
    javaVersion: '17.0.1',
  },
}

const server = setupServer(
  rest.get('/health', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getHealth', () => {
  it('should return the health data when successful', async () => {
    const response = await getHealth()
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when the request fails', async () => {
    server.use(
      rest.get('/health', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )
    await expect(getHealth()).rejects.toBeDefined()
  })
})
