import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useFrequentCommands } from './useFrequentCommands'
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
      })
    )
  }),
  rest.get('/commands/frequent', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        result: [
          "! onESPclient brent - 'slots [24,26,31] => [:dry,:archive_bac]'",
          "!%20onESPclient%20brent%20%E2%80%93%20'slots%20%5B24%2C26%2C31%5D%3D%3E%5B%3Adry%2C%3Aarchive_bac%5D'",
          'restart logs',
          'stop',
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
  const query = useFrequentCommands({ vehicleName: 'sim' })

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

describe('useFrequentCommands', () => {
  it('should display the command keyword', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockCommands />
      </MockProviders>
    )

    await waitFor(() => {
      return screen.getByTestId('command')
    })

    expect(screen.getByTestId('command')).toHaveTextContent(
      "! onESPclient brent - 'slots [24,26,31] => [:dry,:archive_bac]'"
    )
    expect(screen.getByTestId('description')).toHaveTextContent(
      'Bash command with no stdin, stdout routed to syslog IMPORTANT'
    )
  })
})
