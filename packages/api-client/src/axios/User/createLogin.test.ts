import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createLogin } from './createLogin'

describe('createLogin', () => {
  let params = {
    email: 'some-user@example.com',
    password: 'some-password',
  }

  const mockResponse = {
    result: {
      email: 'jim@sumocreations.com',
      firstName: 'Jim',
      lastName: 'Jeffers',
      roles: ['operator'],
      token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKaW0iLCJsYXN0TmFtZSI6IkplZmZlcnMiLCJleHAiOjE2NTM3NzgzODYsImVtYWlsIjoiamltQHN1bW9jcmVhdGlvbnMuY29tIiwicm9sZXMiOlsib3BlcmF0b3IiXX0.iIE60rpDVtL56Kt9p_Zs4MFLaDj03ISiJ9TVjr44Q24',
    },
  }

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
    expect(token).toEqual(mockResponse.result.token)
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
