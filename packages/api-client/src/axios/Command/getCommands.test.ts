import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getCommands } from './getCommands'

const mockResponse = {
  result: {
    commands: [
      {
        advanced: false,
        description: 'Show help',
        keyword: '?',
        syntaxList: [
          {
            argList: [],
            help: 'Get general help',
          },
          {
            argList: [
              {
                argType: 'ARG_COMMAND',
                required: 'REQUIRED',
              },
            ],
            help: 'Get help on a command',
          },
        ],
      },
      {
        advanced: true,
        description:
          'Bash command with no stdin, stdout routed to syslog IMPORTANT',
        keyword: '!',
        syntaxList: [
          {
            argList: [
              {
                argType: 'ARG_STRING',
                required: 'REQUIRED',
              },
            ],
            help: 'bash command',
          },
        ],
      },
      {
        advanced: true,
        description: 'Burn (or stop burning) the burnwire',
        keyword: 'burn',
        syntaxList: [
          {
            argList: [
              {
                argType: 'ARG_KEYWORD',
                keyword: 'off',
                required: 'REQUIRED',
              },
            ],
            help: 'Terminate burnwire burn',
          },
        ],
      },
    ],
    serviceTypes: ['Courier', 'Express', 'Normal', 'Priority'],
    decimationTypes: ['all', 'linearApproximation', 'mostRecent', 'none'],
  },
}

const server = setupServer(
  rest.get('/commands', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getCommands', () => {
  // TODO: Add tests for the actual API call
  it('should return the mocked value when successful', async () => {
    const response = await getCommands()
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('/command', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getCommands()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
