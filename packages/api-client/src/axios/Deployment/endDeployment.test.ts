import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { endDeployment, EndDeploymentParams } from './endDeployment'

let params: EndDeploymentParams = {
  deploymentId: 'example',
  date: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.post('/deployments/end', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('endDeployment', () => {
  it('should return the mocked value when successful', async () => {
    const response = await endDeployment(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/deployments/end', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await endDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should send deploymentId and date as query params in the URL', async () => {
    const mockPost = jest.fn().mockResolvedValue({ data: mockResponse })
    const mockInstance = { post: mockPost } as any

    await endDeployment(
      { deploymentId: 'abc123', date: '2024-06-01T00:00:00Z' },
      { instance: mockInstance }
    )

    expect(mockPost).toHaveBeenCalledTimes(1)
    const [url] = mockPost.mock.calls[0]
    const searchParams = new URLSearchParams(url.split('?')[1])
    expect(searchParams.get('deploymentId')).toBe('abc123')
    expect(searchParams.get('date')).toBe('2024-06-01T00:00:00Z')
  })
})
