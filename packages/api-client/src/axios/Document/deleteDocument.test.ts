import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { deleteDocument, DeleteDocumentParams } from './deleteDocument'

let params: DeleteDocumentParams = {
  docId: 'example',
}

const mockResponse = undefined
const server = setupServer(
  rest.delete('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteDocument', () => {
  it('should return the mocked value when successful', async () => {
    const response = await deleteDocument(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete('/documents', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await deleteDocument(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
