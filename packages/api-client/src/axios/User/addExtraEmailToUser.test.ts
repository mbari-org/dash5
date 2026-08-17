import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  addExtraEmailToUser,
  AddExtraEmailToUserParams,
} from './addExtraEmailToUser'

const params: AddExtraEmailToUserParams = {
  email: 'primary@example.com',
  addExtraEmail: 'extra@example.com',
  code: '482913',
}

const mockResponse = {
  result: {
    email: 'primary@example.com',
  },
}

let capturedBody: Record<string, unknown> = {}

const server = setupServer(
  rest.put('/user', (req, res, ctx) => {
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

describe('addExtraEmailToUser', () => {
  it('should return the updated user on success', async () => {
    const response = await addExtraEmailToUser(params)
    expect(response.result.email).toEqual(mockResponse.result.email)
  })

  it('should send addExtraEmail (singular) and code, not the deprecated addExtraEmails field', async () => {
    await addExtraEmailToUser(params)
    expect(capturedBody).toEqual(params)
    expect(capturedBody).toHaveProperty('addExtraEmail', params.addExtraEmail)
    expect(capturedBody).toHaveProperty('code', params.code)
    expect(capturedBody).not.toHaveProperty('addExtraEmails')
    expect(capturedBody).not.toHaveProperty('extraEmails')
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
