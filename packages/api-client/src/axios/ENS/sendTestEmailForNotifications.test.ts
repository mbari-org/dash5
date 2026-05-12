import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  sendTestEmailForNotifications,
  SendTestEmailForNotificationsParams,
} from './sendTestEmailForNotifications'

const params: SendTestEmailForNotificationsParams = {
  email: 'test@mbari.org',
  plainText: 'y',
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('sendTestEmailForNotifications', () => {
  it('returns the unwrapped body when the server sends { email_sent } directly', async () => {
    server.use(
      rest.post('/ens/test', (_req, res, ctx) =>
        res(ctx.status(200), ctx.json({ email_sent: 'test@mbari.org' }))
      )
    )
    const response = await sendTestEmailForNotifications(params)
    expect(response).toEqual({ email_sent: 'test@mbari.org' })
  })

  it('unwraps result when the server sends { result: { email_sent } }', async () => {
    server.use(
      rest.post('/ens/test', (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({ result: { email_sent: 'test@mbari.org' } })
        )
      )
    )
    const response = await sendTestEmailForNotifications(params)
    expect(response).toEqual({ email_sent: 'test@mbari.org' })
  })

  it('handles a wrapped response where email_sent is absent without throwing', async () => {
    server.use(
      rest.post('/ens/test', (_req, res, ctx) =>
        res(ctx.status(200), ctx.json({ result: {} }))
      )
    )
    const response = await sendTestEmailForNotifications(params)
    expect(response).toEqual({})
    expect(response.email_sent).toBeUndefined()
  })

  it('throws when the server returns an error status', async () => {
    server.use(
      rest.post('/ens/test', (_req, res, ctx) => res.once(ctx.status(500)))
    )
    await expect(sendTestEmailForNotifications(params)).rejects.toBeDefined()
  })
})
