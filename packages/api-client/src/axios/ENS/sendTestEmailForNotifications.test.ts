import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  sendTestEmailForNotifications,
  SendTestEmailForNotificationsParams,
} from './sendTestEmailForNotifications'

let params: SendTestEmailForNotificationsParams = {
  email: 'example',
  plainText: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/ens/test', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('sendTestEmailForNotifications', () => {
  it('should return the mocked value when successful', async () => {
    const response = await sendTestEmailForNotifications(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/ens/test', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await sendTestEmailForNotifications(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
