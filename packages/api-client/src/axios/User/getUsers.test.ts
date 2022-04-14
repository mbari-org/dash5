import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getUsers, GetUsersParams } from './getUsers'

let params: GetUsersParams = {}

const mockResponse = { users: [] }
const server = setupServer(
  rest.get('/user', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getUsers', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked users when successful', async () => {
    const { users } = await getUsers(params)
    expect(users).toEqual(mockResponse.users)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/user', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getUsers(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
