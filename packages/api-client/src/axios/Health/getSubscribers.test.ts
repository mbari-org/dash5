import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getSubscribers, GetSubscribersResponse } from './getSubscribers'

export const mockResponse: { result: GetSubscribersResponse } = {
  result: {
    'user@mbari.org': {
      sessions: [
        { tduiv: '5.1.42', openedMs: 1718755200000, session: 'abc123' },
      ],
    },
    'other@mbari.org': {
      sessions: [
        { tduiv: '4.9.9', openedMs: 1718755100000, session: 'def456' },
        { tduiv: null, openedMs: null, session: 'ghi789' },
      ],
    },
  },
}

let capturedAuthHeader: string | null = null

const server = setupServer(
  rest.get('/async/subscribers', (req, res, ctx) => {
    capturedAuthHeader = req.headers.get('Authorization')
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
beforeEach(() => {
  capturedAuthHeader = null
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getSubscribers', () => {
  it('should return subscriber data when successful', async () => {
    const response = await getSubscribers()
    expect(response).toEqual(mockResponse.result)
  })

  it('should send the Authorization header when provided', async () => {
    await getSubscribers({
      headers: { Authorization: 'Bearer test-token' } as never,
    })
    expect(capturedAuthHeader).toBe('Bearer test-token')
  })

  it('should throw when the request fails (e.g. 403 unauthorized)', async () => {
    server.use(
      rest.get('/async/subscribers', (_req, res, ctx) => {
        return res.once(ctx.status(403))
      })
    )
    await expect(getSubscribers()).rejects.toBeDefined()
  })
})
