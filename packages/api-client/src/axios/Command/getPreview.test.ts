import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getPreview, GetPreviewParams } from './getPreview'

let params: GetPreviewParams = {
  vehicle: 'brizo',
  commandText: 'exec TEST',
  schedId: '12345',
  schedDate: '2022-01-01',
}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/commands/preview', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...mockResponse,
        vehicle: req.url.searchParams.get('vehicle'),
        commandText: req.url.searchParams.get('commandText'),
        schedId: req.url.searchParams.get('schedId'),
        schedDate: req.url.searchParams.get('schedDate'),
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getPreview', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getPreview(params)
    expect(response).toEqual({ ...mockResponse, ...params })
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/commands/preview', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getPreview(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
