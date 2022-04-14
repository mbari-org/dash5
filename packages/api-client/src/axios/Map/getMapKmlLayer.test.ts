import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getMapKmlLayer, GetMapKmlLayerParams } from './getMapKmlLayer'

let params: GetMapKmlLayerParams = {
  path: 'example',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/info/map/kmlLayer', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getMapKmlLayer', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getMapKmlLayer(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/info/map/kmlLayer', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getMapKmlLayer(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
