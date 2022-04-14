import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getEmailNotifications,
  GetEmailNotificationsParams,
} from './getEmailNotifications'

let params: GetEmailNotificationsParams = {
  allUsers: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/ens/emails', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getEmailNotifications', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getEmailNotifications(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/ens/emails', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getEmailNotifications(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
