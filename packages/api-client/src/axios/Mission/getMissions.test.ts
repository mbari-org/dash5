import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getMissions, GetMissionsParams } from './getMissions'

let params: GetMissionsParams = {
  deploymentId: 1,
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getMissions', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getMissions(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getMissions(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
