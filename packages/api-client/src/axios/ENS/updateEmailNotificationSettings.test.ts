import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { updateEmailNotificationSettings, UpdateEmailNotificationSettingsParams } from './updateEmailNotificationSettings'

let params: UpdateEmailNotificationSettingsParams = {
  email: "example",
  plainText: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.put("/ens", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('updateEmailNotificationSettings', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await updateEmailNotificationSettings(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put("/ens", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await updateEmailNotificationSettings(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
