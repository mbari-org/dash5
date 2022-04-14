import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  deleteEmailNotificationSettings,
  DeleteEmailNotificationSettingsParams,
} from './deleteEmailNotificationSettings'

let params: DeleteEmailNotificationSettingsParams = {
  email: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.delete('/ens', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteEmailNotificationSettings', () => {
  it('should return the mocked value when successful', async () => {
    const response = await deleteEmailNotificationSettings(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete('/ens', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await deleteEmailNotificationSettings(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
