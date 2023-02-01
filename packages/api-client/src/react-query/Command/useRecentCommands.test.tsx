import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRecentCommands } from './useRecentCommands'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const server = setupServer(
  rest.get('/commands', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
              description: 'Restart a vehicle process',
              keyword: 'restart',
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
      })
    )
  }),
  rest.get('/commands/recent', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        result: [
          {
            eventId: 17098211,
            vehicleName: 'brizo',
            unixTime: 1660084789730,
            isoTime: '2022-08-09T22:39:49.730Z',
            eventType: 'command',
            user: 'Brian Kieft',
            data: 'restart hardware',
            text: 'restart hardware',
          },
          {
            eventId: 17098049,
            vehicleName: 'brizo',
            unixTime: 1660082686356,
            isoTime: '2022-08-09T22:04:46.356Z',
            eventType: 'command',
            user: 'Brian Kieft',
            data: 'restart sys',
            text: 'restart sys',
          },
        ],
      })
    )
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockCommands: React.FC = () => {
  const query = useRecentCommands({ vehicle: 'sim' })

  return query.isLoading ? null : (
    <div>
      <span data-testid="command">
        {query.data?.[0]?.writtenCommand ?? 'Loading'}
      </span>
      <span data-testid="description">
        {query.data?.[0]?.command.description ?? 'Loading'}
      </span>
    </div>
  )
}

describe('useRecentCommands', () => {
  it('should display the command keyword', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockCommands />
      </MockProviders>
    )

    await waitFor(() => {
      return screen.getByTestId('command')
    })

    expect(screen.getByTestId('command')).toHaveTextContent('restart hardware')
    expect(screen.getByTestId('description')).toHaveTextContent(
      'Restart a vehicle process'
    )
  })
})
