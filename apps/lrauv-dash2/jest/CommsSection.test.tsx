import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CommsSection from '../components/CommsSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../components/testHelpers'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/events', (req, res, ctx) => {
    if (req.url.searchParams.get('noteMatches') === 'Timeout while waiting') {
      return res(ctx.status(200), ctx.json({ result: [] }))
    }
    return res(ctx.status(200), ctx.json({ result: [] }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('CommsSection timeout override', () => {
  test('overrides queued/sent status to timeout when internal timeout-notes query returns a matching note', async () => {
    // The command (eventId 16824954) will appear as 'queued' from useCommsEvents
    // (only a command event, no sbdSend). A timeout note referencing that eventId
    // is returned by the timeout-notes query so timedOutMap should override the
    // status to 'timeout' and the cell renders 'Cell timeout expired'.
    const noteIsoTime = '2022-05-24T20:10:00.000Z'
    server.use(
      rest.get('/events', (req, res, ctx) => {
        if (
          req.url.searchParams.get('noteMatches') === 'Timeout while waiting'
        ) {
          return res(
            ctx.status(200),
            ctx.json({
              result: [
                {
                  eventId: 99000001,
                  vehicleName: 'makai',
                  unixTime: new Date(noteIsoTime).getTime(),
                  isoTime: noteIsoTime,
                  eventType: 'note',
                  user: 'system',
                  // timeoutExpiredRegEx = /id=(\d+):\s*Timeout while waiting/
                  note: 'id=16824954: Timeout while waiting for SBD',
                },
              ],
            })
          )
        }
        // Return a single queued command (no sbdSend/sbdReceipt, so status='queued')
        return res(
          ctx.status(200),
          ctx.json({
            result: [
              {
                eventId: 16824954,
                vehicleName: 'makai',
                unixTime: 1653422230162,
                isoTime: '2022-05-24T19:57:10.162Z',
                eventType: 'command',
                user: 'Brian Kieft',
                data: 'restart app',
                text: 'restart app',
                note: '[[via:cell, timeout:5min]]',
              },
            ],
          })
        )
      })
    )

    render(
      <MockProviders queryClient={new QueryClient()}>
        <CommsSection vehicleName="makai" from={0} />
      </MockProviders>
    )

    // The cell should render the timeout description, not 'Waiting to transmit'
    await waitFor(
      () => {
        expect(screen.getByText(/Cell timeout expired/i)).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })
})
