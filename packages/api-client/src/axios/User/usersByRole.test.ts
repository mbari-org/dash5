import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { usersByRole, ByRoleParams } from './usersByRole'

let params: ByRoleParams = {
  role: 'none',
}

export const mockResponse = {
  result: [
    { email: 'mjstanway@mbari.org', fullName: 'M Jordan Stanway' },
    { email: 'zz@example.net', fullName: 'Tester PleaseIgnore' },
    { email: 'zzjd@example.net', fullName: 'John Doe' },
  ],
}

const server = setupServer(
  rest.get('/user/byrole', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('usersByRole', () => {
  it('should return the mocked value when successful', async () => {
    const response = await usersByRole(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/user/byrole', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await usersByRole(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
