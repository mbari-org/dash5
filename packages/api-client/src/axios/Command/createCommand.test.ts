import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createCommand, CreateCommandParams } from './createCommand'

let params: CreateCommandParams = {
  vehicle: 'example',
  path: 'example',
  commandText: 'example',
  commandNote: 'example',
  runCommand: 'example',
  schedDate: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/commands', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('createCommand', () => {
  it('should return the mocked value when successful', async () => {
    const response = await createCommand(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/commands/preview', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await createCommand(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
