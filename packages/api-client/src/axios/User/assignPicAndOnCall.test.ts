import { rest } from 'msw'
import { setupServer } from 'msw/node'
import {
  assignPicAndOnCall,
  AssignPicAndOnCallParams,
} from './assignPicAndOnCall'

export const params: AssignPicAndOnCallParams = {
  vehicleName: 'example',
  sign: 'in',
  subRole: 'PIC',
}

export const mockResponse = {
  result: {
    eventId: 17069984,
    vehicleName: 'sim',
    unixTime: 1658442805756,
    isoTime: '2022-07-21T22:33:25.756Z',
    eventType: 'note',
    state: 0,
    user: 'Jim Jeffers',
    note: 'Signing in as PIC',
  },
}

const server = setupServer(
  rest.post('/user/picoc', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('assignPicAndOnCall', () => {
  it('should return the mocked value when successful', async () => {
    const response = await assignPicAndOnCall(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/user/picoc', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await assignPicAndOnCall(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
