import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getEmailNotificationSettings,
  GetEmailNotificationSettingsParams,
} from './getEmailNotificationSettings'

let params: GetEmailNotificationSettingsParams = {
  email: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/ens', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getEmailNotificationSettings', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getEmailNotificationSettings(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/ens', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getEmailNotificationSettings(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
