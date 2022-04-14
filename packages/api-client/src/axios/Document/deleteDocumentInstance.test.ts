import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  deleteDocumentInstance,
  DeleteDocumentInstanceParams,
} from './deleteDocumentInstance'

let params: DeleteDocumentInstanceParams = {
  docInstanceId: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.delete('/documents/instance', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteDocumentInstance', () => {
  it('should return the mocked value when successful', async () => {
    const response = await deleteDocumentInstance(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete('/documents/instance', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await deleteDocumentInstance(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
