import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getUnits } from './getUnits'

export const mockResponse = {
  result: [
    {
      name: 'ampere',
      abbreviation: 'A',
    },
    {
      name: 'ampere_hour',
      abbreviation: 'Ah',
      baseUnit: 'ampere_second',
    },
    {
      name: 'ampere_per_count',
      abbreviation: 'A/count',
    },
    {
      name: 'ampere_per_meter',
      abbreviation: 'A/m',
    },
  ],
}

const server = setupServer(
  rest.get('/commands/units', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getUnits', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getUnits()
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/command/units', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getUnits()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
