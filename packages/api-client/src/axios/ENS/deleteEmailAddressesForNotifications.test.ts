import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { deleteEmailAddressesForNotifications, DeleteEmailAddressesForNotificationsParams } from './deleteEmailAddressesForNotifications'

let params: DeleteEmailAddressesForNotificationsParams = {
  email: "example",
  extraEmail: "example",
  
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.delete("/ens/email", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteEmailAddressesForNotifications', () => {

  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await deleteEmailAddressesForNotifications(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete("/ens/email", (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await deleteEmailAddressesForNotifications(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
