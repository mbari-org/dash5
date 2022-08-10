import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getMissions, GetMissionsParams } from './getMissions'

let params: GetMissionsParams = {}

const mockResponse = {
  result: {
    tag: '2022-07-19',
    filenames: [
      'BehaviorScripts/',
      'Demo/',
      'Engineering/',
      'Insert/',
      'Maintenance/',
      'RegressionTests/',
      'Science/',
      'Transport/',
      '_examples/',
      'underIce/',
      '.gitignore',
      'CONTRIBUTING.md',
      'Default.xml',
      'Startup.xml',
    ],
  },
}

const server = setupServer(
  rest.get('/git/missions', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getMissions', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getMissions(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/git/missions', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getMissions(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
