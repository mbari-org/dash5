import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createNote, CreateNoteParams } from './createNote'

let params: CreateNoteParams = {
  vehicle: 'example',
  note: 'example',
}

export const mockResponse = {
  result: {
    date: 'Nov 17, 2016 12:35:28 PM',
    status: 'postNote request submitted',
    vehicle: 'sim',
  },
}

const server = setupServer(
  rest.post('/events/note', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('createNote', () => {
  it('should return the mocked value when successful', async () => {
    const response = await createNote(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/events/note', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await createNote(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
