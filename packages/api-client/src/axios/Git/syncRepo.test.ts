import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { syncRepo, SyncRepoParams } from './syncRepo'

let params: SyncRepoParams = {
  repoName: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/git/sync', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('syncRepo', () => {
  it('should return the mocked value when successful', async () => {
    const response = await syncRepo(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/git/sync', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await syncRepo(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
