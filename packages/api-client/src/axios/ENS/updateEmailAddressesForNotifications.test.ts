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
  code: '482913',
}

const mockResponse = { value: 'some-value' }
let capturedSearch: string = ''

const server = setupServer(
  rest.put('/ens/email', (req, res, ctx) => {
    capturedSearch = req.url.search
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  capturedSearch = ''
  server.resetHandlers()
})
afterAll(() => server.close())

describe('updateEmailAddressesForNotifications', () => {
  it('should return the mocked value when successful', async () => {
    const response = await updateEmailAddressesForNotifications(params)
    expect(response).toEqual(mockResponse)
  })

  it('should send code as a required query param', async () => {
    await updateEmailAddressesForNotifications(params)
    const searchParams = new URLSearchParams(capturedSearch)
    expect(searchParams.get('code')).toEqual(params.code)
    expect(searchParams.get('email')).toEqual(params.email)
    expect(searchParams.get('extraEmail')).toEqual(params.extraEmail)
    expect(searchParams.get('newExtraEmail')).toEqual(params.newExtraEmail)
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
