import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createUser, CreateUserParams } from './createUser'

let params: CreateUserParams = {
  email: 'new.user@example.com',
  firstName: 'New',
  lastName: 'User',
  requestedRoles: 'operator',
  password: 'password',
  recaptchaResponse: 'captcha',
}

const mockResponse = {
  result: {
    firstName: 'Please Ignore',
    lastName: 'Jim Testing API Response',
    email: 'jim+test@sumocreations.com',
    requestedRoles: ['operator'],
  },
}

let capturedBody: Record<string, unknown> = {}

const server = setupServer(
  rest.post('/user', (req, res, ctx) => {
    capturedBody = req.body as Record<string, unknown>
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  capturedBody = {}
  server.resetHandlers()
})
afterAll(() => server.close())

describe('createUser', () => {
  it('should return the mocked users when successful', async () => {
    const user = await createUser(params)
    expect(user).toEqual(mockResponse.result)
  })

  it('should send params directly in the POST body without a { data: } wrapper', async () => {
    await createUser(params)
    expect(capturedBody).toEqual(params)
    expect(capturedBody).not.toHaveProperty('data')
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/user', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await createUser(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
