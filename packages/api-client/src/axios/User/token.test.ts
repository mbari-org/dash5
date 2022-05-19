import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { token, TokenParams } from './token'

let params: TokenParams = {}

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
  rest.get('/user/token', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('token', () => {
  it('should return the mocked value when successful', async () => {
    const response = await token(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/user/token', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await token(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
