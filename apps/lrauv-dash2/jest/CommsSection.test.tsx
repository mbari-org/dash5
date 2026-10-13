import '@testing-library/jest-dom'
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

// ── Loading-state regression tests (#887) ─────────────────────────────────────

test('Comms overlay spinner appears on empty initial load', async () => {
  // The server never responds — isLoading stays true and dataCount is 0.
  // The AbsoluteOverlay (animate-spin) must be visible.
  server.use(
    rest.get('/events', (_req, res, ctx) => res(ctx.delay('infinite')))
  )
  render(
    <MockProviders queryClient={new QueryClient()}>
      <CommsSection vehicleName="makai" from={0} />
    </MockProviders>
  )
  await waitFor(() => {
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

const commsEvent = {
  eventId: 55001,
  vehicleName: 'makai',
  unixTime: Date.now() - 60 * 1000,
  isoTime: new Date(Date.now() - 60 * 1000).toISOString(),
  eventType: 'command',
  user: 'test-operator',
  data: 'restart app',
  text: 'restart app',
  note: '[[via:cell, timeout:5min]]',
}

test('Comms overlay spinner does not appear during a background refetch with visible rows', async () => {
  // First load: row appears, isLoading → false.
  // Second load (triggered by clicking reload): isFetching → true while the
  // row is still visible. The overlay must not cover it.
  server.use(
    rest.get('/events', (req, res, ctx) => {
      if (req.url.searchParams.get('noteMatches') === 'Timeout while waiting') {
        return res(ctx.status(200), ctx.json({ result: [] }))
      }
      return res(ctx.status(200), ctx.json({ result: [commsEvent] }))
    })
  )
  render(
    <MockProviders queryClient={new QueryClient()}>
      <CommsSection vehicleName="makai" from={0} />
    </MockProviders>
  )
  await waitFor(() => {
    expect(screen.getByText(/restart app/i)).toBeInTheDocument()
  })

  // Hold the next request pending so isFetching stays true.
  server.use(
    rest.get('/events', (_req, res, ctx) => res(ctx.delay('infinite')))
  )
  act(() => {
    fireEvent.click(screen.getByRole('button', { name: /reload/i }))
  })

  // Row remains visible and no overlay spinner appears while refetch is in flight.
  expect(screen.getByText(/restart app/i)).toBeInTheDocument()
  expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
})
