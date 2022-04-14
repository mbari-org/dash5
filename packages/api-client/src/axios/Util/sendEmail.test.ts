import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { sendEmail, SendEmailParams } from './sendEmail'

let params: SendEmailParams = {
  email: 'example',
  subject: 'example',
  text: 'example',
  plainText: 'n',
}

const mockResponse = {}

const server = setupServer(
  rest.post('/util/email', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('sendEmail', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await sendEmail(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/util/email', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await sendEmail(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
