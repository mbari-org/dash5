import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { updateDeployment, UpdateDeploymentParams } from './updateDeployment'

let params: UpdateDeploymentParams = {
  deploymentId: 3000406,
  startDate: 'example',
  launchDate: 'example',
  launchNote: 'example',
  recoverDate: 'example',
  recoverNote: 'example',
  endDate: 'example',
  name: 'example',
  tag: 'example',
}

export const mockResponse = {
  result: {
    vehicle: 'sim',
    deploymentId: 3000406,
    startDate: 'Jul 8, 2022 1:12:00 PM',
    sentBy: 'jim@sumocreations.com',
  },
}

const server = setupServer(
  rest.put('/deployments', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('updateDeployment', () => {
  it('should return the mocked value when successful', async () => {
    const response = await updateDeployment(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.put('/deployments', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await updateDeployment(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
