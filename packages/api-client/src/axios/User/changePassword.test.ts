import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { changePassword, ChangePasswordParams } from './changePassword'

let params: ChangePasswordParams = {
  email: 'example',
  password: 'example',
}

const mockResponse = { token: 'some-token' }
const server = setupServer(
  rest.put('/user', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('changePassword', () => {
  it('should return the mocked token when successful', async () => {
    const { token } = await changePassword(params)
    expect(token).toEqual(mockResponse.token)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/user', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await changePassword(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
