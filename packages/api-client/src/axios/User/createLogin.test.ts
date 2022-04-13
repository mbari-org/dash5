import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createLogin } from './createLogin'

describe('createLogin', () => {
  let params = {
    email: 'some-user@example.com',
    password: 'some-password',
  }

  const mockResponse = { token: 'authentication-token' }

  const server = setupServer(
    rest.post('/user/auth', (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mockResponse))
    })
  )

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should return the authentication token when successful', async () => {
    const { token } = await createLogin(params)
    expect(token).toEqual(mockResponse.token)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/user/auth', (_req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    try {
      await createLogin(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
