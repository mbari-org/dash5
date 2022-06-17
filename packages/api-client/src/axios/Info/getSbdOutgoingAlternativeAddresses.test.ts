import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  getSbdOutgoingAlternativeAddresses,
  GetSbdOutgoingAlternativeAddressesParams,
} from './getSbdOutgoingAlternativeAddresses'

let params: GetSbdOutgoingAlternativeAddressesParams = {}

const mockResponse = { value: 'some-value' }
const server = setupServer(
  rest.get('/info/sbd/destAddresses', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getSbdOutgoingAlternativeAddresses', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getSbdOutgoingAlternativeAddresses(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/info/sbd/destAddresses', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getSbdOutgoingAlternativeAddresses(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
