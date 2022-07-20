import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getDocuments, GetDocumentsParams } from './getDocuments'

let params: GetDocumentsParams = {
  docId: '3000798',
  deploymentId: '3000411',
}

export const mockResponse = {
  result: [
    {
      docId: 3000798,
      name: 'Pontus 25 Predeployment checklist MBTS',
      docType: 'FILLED',
      latestRevision: {
        docInstanceId: 3004169,
        unixTime: 1658248106043,
      },
      deploymentBriefs: [
        {
          deploymentId: 3000411,
          name: 'Pontus 25 MBTS',
        },
      ],
      vehicleNames: ['pontus'],
    },
    {
      docId: 3000797,
      name: 'Daphne 115 MBTS - Deployment Plan',
      docType: 'NORMAL',
      latestRevision: {
        docInstanceId: 3004157,
        unixTime: 1657841758399,
      },
      deploymentBriefs: [
        {
          deploymentId: 3000412,
          name: 'Daphne 115 MBTS',
        },
      ],
      vehicleNames: ['daphne'],
    },
  ],
}

const server = setupServer(
  rest.get('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDocuments', () => {
  it('should return the mocked value when successful', async () => {
    const response = await getDocuments(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/documents', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getDocuments(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
