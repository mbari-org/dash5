import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getPicAndOnCall, GetPicAndOnCallParams } from './getPicAndOnCall'

let params: GetPicAndOnCallParams = {
  vehicleName: 'daphne',
}

export const mockResponse = {
  result: {
    vehicleName: 'daphne',
    unixTime: 1658441716188,
    pic: {
      user: 'Lis Henderson',
      email: 'henderson@mbari.org',
      unixTime: 1658419867402,
    },
  },
}

const server = setupServer(
  rest.get('/user/picoc', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getPicAndOnCall', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getPicAndOnCall(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/user/picoc', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getPicAndOnCall(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
