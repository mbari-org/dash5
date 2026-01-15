import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  postRuntimePlatforms,
  PostRuntimePlatformsParams,
} from './postRuntimePlatforms'

const mockResponse = [
  '54065b5560d0e168c88d4012',
  '54065b5560d0e168c88d4013',
  '54065b5560d0e168c88d4014',
]

const server = setupServer(
  rest.post('/runtime/platforms', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('postRuntimePlatforms', () => {
  it('should return the mocked response when successful', async () => {
    const params: PostRuntimePlatformsParams = {
      platformIds: ['54065b5560d0e168c88d4012', '54065b5560d0e168c88d4013'],
    }
    const response = await postRuntimePlatforms(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/runtime/platforms', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    const params: PostRuntimePlatformsParams = {
      platformIds: ['54065b5560d0e168c88d4012'],
    }

    try {
      await postRuntimePlatforms(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
