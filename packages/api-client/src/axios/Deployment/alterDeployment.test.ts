import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { alterDeployment, AlterDeploymentParams } from './alterDeployment'

let params: AlterDeploymentParams = {
  deploymentId: 12345,
  date: 'example',
  note: 'example',
  deploymentType: 'launch',
}

export const mockResponse = {
  result: {
    date: 'Jul 6, 2022 8:35:59 PM',
    sentBy: 'jim@sumocreations.com',
    vehicle: 'sim',
    note: 'Vehicle in water',
    requestMessage:
      'add \u0027launch\u0027: persist deployment resD\u003d0 event resE\u003d0',
  },
}

const server = setupServer(
  rest.post(`/deployments/${params.deploymentType}`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('alterDeployment', () => {
  it('should return the mocked value when successful', async () => {
    const response = await alterDeployment(params)
    console.log(response)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post(`/deployments/${params.deploymentType}`, (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await alterDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should send deploymentId and date but not note for end events', async () => {
    const mockPost = jest.fn().mockResolvedValue({ data: mockResponse })
    const mockInstance = { post: mockPost } as any

    await alterDeployment(
      {
        deploymentId: 12345,
        date: '2024-01-01T00:00:00.000Z',
        note: 'should be stripped',
        deploymentType: 'end',
      },
      { instance: mockInstance }
    )

    expect(mockPost).toHaveBeenCalledTimes(1)
    const [, , config] = mockPost.mock.calls[0]
    expect(config.params.deploymentId).toBe(12345)
    expect(config.params.date).toBe('2024-01-01T00:00:00.000Z')
    expect(config.params.note).toBeUndefined()
  })
})
