import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getDocuments } from './getDocuments'

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDocuments', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getDocuments()
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/documents', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getDocuments()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
