import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getMapLayers, GetMapLayersParams } from './getMapLayers'

let params: GetMapLayersParams = {
  layers: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/info/map/', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getMapLayers', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getMapLayers(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/info/map/', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getMapLayers(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
