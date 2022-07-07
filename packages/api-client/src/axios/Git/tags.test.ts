import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { tags, TagsParams } from './tags'

let params: TagsParams = {
  limit: 1,
}

export const mockResponse = {
  result: [
    {
      tag: '2022-06-30',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-06-30T06:33:11.000-07:00',
    },
    {
      tag: '2022-06-21',
      author: 'bkieft@mbari.org',
      isoDate: '2022-06-20T17:05:18.000-07:00',
    },
    {
      tag: '2022-06-15',
      author: 'byraanan@mbari.org',
      isoDate: '2022-06-09T16:28:19.000-07:00',
    },
    {
      tag: '2022-06-10',
      author: 'byraanan@mbari.org',
      isoDate: '2022-06-09T16:28:19.000-07:00',
    },
    {
      tag: '2022-06-09A',
      author: 'bkieft@mbari.org',
      isoDate: '2022-06-09T10:07:25.000-07:00',
    },
    {
      tag: '2022-06-09',
      author: 'bkieft@mbari.org',
      isoDate: '2022-06-09T10:07:25.000-07:00',
    },
    {
      tag: '2022-06-07',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-05-17T07:44:11.000-07:00',
    },
    {
      tag: '2022-06-02',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-05-17T07:44:11.000-07:00',
    },
    {
      tag: '2022-05-25A',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-05-17T07:44:11.000-07:00',
    },
    {
      tag: '2022-05-25',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-05-17T07:44:11.000-07:00',
    },
    {
      tag: '2022-05-17',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-05-17T07:44:11.000-07:00',
    },
    {
      tag: '2022-05-16C',
      author: 'bkieft@mbari.org',
      isoDate: '2022-05-11T10:28:21.000-07:00',
    },
    {
      tag: '2022-05-16',
      author: 'bkieft@mbari.org',
      isoDate: '2022-05-11T10:28:21.000-07:00',
    },
    {
      tag: '2022-05-16B',
      author: 'byraanan@mbari.org',
      isoDate: '2022-05-10T11:04:21.000-07:00',
    },
    {
      tag: '2022-05-16A',
      author: 'byraanan@mbari.org',
      isoDate: '2022-05-10T11:04:21.000-07:00',
    },
    {
      tag: '2022-05-11',
      author: 'byraanan@mbari.org',
      isoDate: '2022-05-10T11:04:21.000-07:00',
    },
    {
      tag: '2022-04-25',
      author: 'bkieft@mbari.org',
      isoDate: '2022-04-19T13:59:20.000-07:00',
    },
    {
      tag: '2022-04-22A',
      author: 'bkieft@mbari.org',
      isoDate: '2022-04-19T13:59:20.000-07:00',
    },
    {
      tag: '2022-04-22',
      author: 'bkieft@mbari.org',
      isoDate: '2022-04-19T13:59:20.000-07:00',
    },
    {
      tag: '2022-04-20',
      author: 'bkieft@mbari.org',
      isoDate: '2022-04-19T13:59:20.000-07:00',
    },
    {
      tag: '2022-04-13',
      author: 'bkieft@mbari.org',
      isoDate: '2022-04-13T11:30:31.000-07:00',
    },
    {
      tag: '2022-04-11',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-04-07T12:32:28.000-07:00',
    },
    {
      tag: '2022-04-06',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-03-31T09:59:06.000-07:00',
    },
    {
      tag: '2022-04-05',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-03-31T09:59:06.000-07:00',
    },
    {
      tag: '2022-03-28',
      author: 'bkieft@mbari.org',
      isoDate: '2022-03-28T13:55:42.000-07:00',
    },
    {
      tag: '2022-03-27_A',
      author: 'bkieft@mbari.org',
      isoDate: '2022-03-27T12:49:07.000-07:00',
    },
    {
      tag: '2022-03-27',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-03-23T14:53:18.000-07:00',
    },
    {
      tag: '2022-03-24',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-03-23T14:53:18.000-07:00',
    },
    {
      tag: '2022-03-09',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-03-04T13:11:19.000-08:00',
    },
    {
      tag: '2022-03-07_B',
      author: 'lrauv-admin@whoi.edu',
      isoDate: '2022-03-04T13:11:19.000-08:00',
    },
  ],
}

const server = setupServer(
  rest.get('/git/tags', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('tags', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await tags(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/tags', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await tags(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
