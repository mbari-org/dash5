import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  createDocumentInstance,
  CreateDocumentInstanceParams,
} from './createDocumentInstance'

let params: CreateDocumentInstanceParams = {
  docId: 'example',
  newName: 'example',
  text: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/documents/instance', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('createDocumentInstance', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await createDocumentInstance(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/documents/instance', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await createDocumentInstance(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
