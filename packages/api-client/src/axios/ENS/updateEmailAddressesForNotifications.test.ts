import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  updateEmailAddressesForNotifications,
  UpdateEmailAddressesForNotificationsParams,
} from './updateEmailAddressesForNotifications'

let params: UpdateEmailAddressesForNotificationsParams = {
  email: 'example',
  extraEmail: 'example',
  newExtraEmail: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.put('/ens/email', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('updateEmailAddressesForNotifications', () => {
  it('should return the mocked value when successful', async () => {
    const response = await updateEmailAddressesForNotifications(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/ens/email', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await updateEmailAddressesForNotifications(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
