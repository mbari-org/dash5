import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  deleteCommandQueue,
  DeleteCommandQueueParams,
} from './deleteCommandQueue'

const params: DeleteCommandQueueParams = {
  vehicle: 'example',
  refEventId: 12345,
}

const mockResponse = {
  result: 'ok',
}

const server = setupServer(
  rest.delete('/commands/queue', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteCommandQueue', () => {
  it('should return the mocked value when successful', async () => {
    const response = await deleteCommandQueue(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.delete('/commands/queue', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    await expect(deleteCommandQueue(params)).rejects.toBeDefined()
  })
})
