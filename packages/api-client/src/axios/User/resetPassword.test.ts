import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { resetPassword, ResetPasswordParams } from './resetPassword'

let params: ResetPasswordParams = {
  email: 'example',
}

const mockResponse = { message: 'some-message' }

const server = setupServer(
  rest.post('/user/rpw', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('resetPassword', () => {
  it('should return the mocked message when successful', async () => {
    const { message } = await resetPassword(params)
    expect(message).toEqual(mockResponse.message)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/user/rpw', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await resetPassword(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
