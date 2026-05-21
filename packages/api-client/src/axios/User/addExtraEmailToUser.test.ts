import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  addExtraEmailToUser,
  AddExtraEmailToUserParams,
} from './addExtraEmailToUser'

const params: AddExtraEmailToUserParams = {
  email: 'primary@example.com',
  addExtraEmails: 'extra@example.com',
}

const mockResponse = {
  result: {
    email: 'primary@example.com',
    extraEmails: ['extra@example.com'],
  },
}

const server = setupServer(
  rest.put('/user', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('addExtraEmailToUser', () => {
  it('should return the updated user on success', async () => {
    const response = await addExtraEmailToUser(params)
    expect(response.result.email).toEqual(mockResponse.result.email)
    expect(response.result.extraEmails).toEqual(mockResponse.result.extraEmails)
  })

  it('should throw when the server returns an error', async () => {
    server.use(
      rest.put('/user', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )
    await expect(addExtraEmailToUser(params)).rejects.toBeDefined()
  })
})
