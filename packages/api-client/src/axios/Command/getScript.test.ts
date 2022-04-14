import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getScript, GetScriptParams } from './getScript'

let params: GetScriptParams = {
  deploymentPath: '/opt/example',
  path: 'Missions/Science/sci2.xml',
  deploymentId: 'exampleID',
}

const mockResponse = { result: 'some-result' }
const server = setupServer(
  rest.get('/commands/script', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...mockResponse,
        deploymentPath: req.url.searchParams.get('deploymentPath'),
        path: req.url.searchParams.get('path'),
        deploymentId: req.url.searchParams.get('deploymentId'),
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getScript', () => {
  it('should return the mocked result/params when successful', async () => {
    const { result, deploymentPath, deploymentId, path } = (await getScript(
      params
    )) as {
      result: string
      deploymentPath: string
      path: string
      deploymentId: string
    }
    expect(result).toEqual(mockResponse.result)
    expect(path).toEqual(params.path)
    expect(deploymentId).toEqual(params.deploymentId)
    expect(deploymentPath).toEqual(params.deploymentPath)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/script', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getScript(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
