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

const successResponse = {
  result: { eventId: 12345, vehicle: 'example' },
}

const refusedResponse = {
  error: 'Command already dispatched to vehicle',
}

const server = setupServer(
  rest.delete('/commands/queue', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(successResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('deleteCommandQueue', () => {
  it('should return the full response envelope on success', async () => {
    const response = await deleteCommandQueue(params)
    expect(response).toEqual(successResponse)
    expect(response.error).toBeUndefined()
  })

  it('should return the error field when the cancel is refused', async () => {
    server.use(
      rest.delete('/commands/queue', (_req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json(refusedResponse))
      })
    )

    const response = await deleteCommandQueue(params)
    expect(response.error).toBe('Command already dispatched to vehicle')
    expect(response.result).toBeUndefined()
  })

  it('should pass force param when provided', async () => {
    let capturedForce: string | null = null
    server.use(
      rest.delete('/commands/queue', (req, res, ctx) => {
        capturedForce = req.url.searchParams.get('force')
        return res.once(ctx.status(200), ctx.json(successResponse))
      })
    )

    await deleteCommandQueue({ ...params, force: true })
    expect(capturedForce).toBe('true')
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
