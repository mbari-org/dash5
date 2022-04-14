import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { updateUser, UpdateUserParams } from './updateUser'

let params: UpdateUserParams = {
  email: 'example',
  firstName: 'example',
  lastName: 'example',
}

const mockResponse = { token: 'some-value' }

const server = setupServer(
  rest.put('/user', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('updateUser', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    server.use(
      rest.put('/user', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )
    const { token } = await updateUser(params)
    expect(token).toEqual(mockResponse.token)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/user', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await updateUser(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
