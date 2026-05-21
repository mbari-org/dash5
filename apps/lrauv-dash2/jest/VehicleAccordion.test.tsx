import React from 'react'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import VehicleAccordion from '../components/VehicleAccordion'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../components/testHelpers'

const server = setupServer(
  rest.get('/events/mission-started', (_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ result: [] }))
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const props = {
  vehicleName: 'example',
  from: Date.now() - 3600 * 1000,
  activeDeployment: true,
  currentDeploymentId: 1,
}

// Helper: build a minimal command event + matching sbdSend for a given comms state.
// 'queued'  → command with no sbdSend (cell, not yet dispatched)
// 'sent'    → command + sbdSend state:1 (sat dispatched, no sbdReceive yet)
// 'ack'     → command + sbdSend state:2 (cell instant-ack)
// 'timeout' → command + timeout note (cell, vehicle never fetched)
const noteForStatus: Record<'queued' | 'sent' | 'ack' | 'timeout', string> = {
  queued: '[[via:cell, timeout:5min]]',
  sent: '[[via:sat, timeout:30min]]',
  ack: '[[via:cell, timeout:5min]]',
  timeout: '[[via:cell, timeout:5min]]',
}

const makeEvents = (
  scenarios: Array<{
    eventId: number
    commsStatus: 'queued' | 'sent' | 'ack' | 'timeout'
  }>
) => {
  const result: object[] = []
  scenarios.forEach(({ eventId, commsStatus }) => {
    result.push({
      eventId,
      eventType: 'command',
      data: 'restart logs',
      unixTime: Date.now() - 60 * 1000,
      text: null,
      note: noteForStatus[commsStatus],
      user: 'test-operator',
    })
    if (commsStatus === 'ack') {
      result.push({
        eventId: eventId + 1000,
        eventType: 'sbdSend',
        refId: eventId,
        state: 2,
        unixTime: Date.now() - 58 * 1000,
        isoTime: new Date(Date.now() - 58 * 1000).toISOString(),
        data: null,
        text: null,
        note: null,
        user: null,
      })
    }
    if (commsStatus === 'sent') {
      result.push({
        eventId: eventId + 1000,
        eventType: 'sbdSend',
        refId: eventId,
        state: 1,
        unixTime: Date.now() - 58 * 1000,
        isoTime: new Date(Date.now() - 58 * 1000).toISOString(),
        data: null,
        text: null,
        note: null,
        user: null,
      })
    }
    if (commsStatus === 'timeout') {
      result.push({
        eventId: eventId + 2000,
        eventType: 'note',
        unixTime: Date.now() - 55 * 1000,
        isoTime: new Date(Date.now() - 55 * 1000).toISOString(),
        data: null,
        text: null,
        note: `id=${eventId}: Timeout while waiting for ack`,
        user: null,
      })
    }
  })
  return result
}

// ── Comms Queue count regression tests (#598) ─────────────────────────────────

test('queue count shows 0 when all commands are ack-ed', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({ result: makeEvents([{ eventId: 100, commsStatus: 'ack' }]) })
      )
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('0 item(s) in queue')).toBeInTheDocument()
  })
})

test('queue count shows 1 for a queued (not yet dispatched) command', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: makeEvents([{ eventId: 200, commsStatus: 'queued' }]),
        })
      )
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('1 item(s) in queue')).toBeInTheDocument()
  })
})

test('queue count shows 1 for a sent (dispatched, not yet fetched) command', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: makeEvents([{ eventId: 300, commsStatus: 'sent' }]),
        })
      )
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('1 item(s) in queue')).toBeInTheDocument()
  })
})

test('queue count shows 0 for a timed-out command — timeout is not "in queue"', async () => {
  // Regression for #598: before the fix, timed-out commands were included in
  // the count because the filter was (status !== 'ack'), which catches timeout.
  // After the fix the filter is (status === 'queued' || status === 'sent').
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: makeEvents([{ eventId: 400, commsStatus: 'timeout' }]),
        })
      )
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('0 item(s) in queue')).toBeInTheDocument()
  })
})

test('queue count excludes a command that is "sent" in commsEvents but timed-out in the timeout-notes query', async () => {
  // Regression for the cross-query gap: useCommsEvents paginates newest-first
  // and may not reach an old timeout note, leaving the command as 'sent'.
  // The dedicated timeout-notes query (noteMatches=Timeout while waiting) covers
  // the full history via recursive backfill and should override that status.
  server.use(
    rest.get('/events', (req, res, ctx) => {
      const noteMatches = req.url.searchParams.get('noteMatches')
      if (noteMatches === 'Timeout while waiting') {
        // The dedicated timeout-notes query returns the note for command 350.
        return res(
          ctx.status(200),
          ctx.json({
            result: [
              {
                eventId: 1350,
                eventType: 'note',
                unixTime: Date.now() - 55 * 1000,
                isoTime: new Date(Date.now() - 55 * 1000).toISOString(),
                data: null,
                text: null,
                note: 'id=350: Timeout while waiting for ack',
                user: null,
              },
            ],
          })
        )
      }
      // The commsEvents query returns command 350 as 'sent' (no timeout note here).
      return res(
        ctx.status(200),
        ctx.json({
          result: makeEvents([{ eventId: 350, commsStatus: 'sent' }]),
        })
      )
    })
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('0 item(s) in queue')).toBeInTheDocument()
  })
})

test('queue count ignores sent commands from a previous deployment', async () => {
  // A 'sent' command whose unixTime is before the deployment start (from) must
  // not inflate the badge — it belongs to a prior deployment.
  server.use(
    rest.get('/events', (req, res, ctx) => {
      // The timeout-notes sub-query (noteMatches=Timeout while waiting) must
      // return an empty note list so it doesn't interfere with this test.
      if (req.url.searchParams.get('noteMatches') === 'Timeout while waiting') {
        return res(ctx.status(200), ctx.json({ result: [] }))
      }
      return res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              eventId: 450,
              eventType: 'command',
              data: 'old command',
              // 2 hours before the deployment start (props.from = now - 1hr)
              unixTime: Date.now() - 2 * 3600 * 1000,
              isoTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
              note: '[[via:sat, timeout:30min]]',
              vehicleName: 'example',
              user: 'test-operator',
            },
            {
              eventId: 1450,
              eventType: 'sbdSend',
              refId: 450,
              state: 1,
              unixTime: Date.now() - 2 * 3600 * 1000 + 5000,
              isoTime: new Date(
                Date.now() - 2 * 3600 * 1000 + 5000
              ).toISOString(),
              data: null,
              text: null,
              note: null,
              vehicleName: 'example',
              user: null,
            },
          ],
        })
      )
    })
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('0 item(s) in queue')).toBeInTheDocument()
  })
})

// ── Accordion tab persistence (#278) ──────────────────────────────────────────

describe('accordion section persistence via localStorage', () => {
  const STORAGE_KEY = 'accordion:section'

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    // Silence MSW unhandled-request warnings for the queries VehicleAccordion
    // always fires on mount (useCommsEvents, useEvents timeout-notes).
    server.use(
      rest.get('/events', (_req, res, ctx) =>
        res(ctx.status(200), ctx.json({ result: [] }))
      )
    )
  })
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
    server.resetHandlers()
  })

  const renderAccordion = () =>
    render(
      <MockProviders queryClient={new QueryClient()}>
        <VehicleAccordion {...props} />
      </MockProviders>
    )

  test('opening a tab saves the section to localStorage', () => {
    renderAccordion()
    fireEvent.click(screen.getByText('Log'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('log')
  })

  test('closing an open tab removes the key from localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, 'log')
    renderAccordion()
    // useEffect restores the section after mount — wait for it
    await waitFor(() =>
      expect(screen.getByText('Log').closest('div')).toHaveClass(
        'bg-primary-600'
      )
    )
    // Section is now open; one click closes it
    act(() => fireEvent.click(screen.getByText('Log')))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  test('restores the previously open tab on mount', async () => {
    // Use 'log' rather than 'schedule' to avoid mounting ScheduleSection
    // (which triggers unmocked network requests)
    localStorage.setItem(STORAGE_KEY, 'log')
    renderAccordion()
    // useEffect restores the section after hydration — wait for it
    await waitFor(() => {
      const headerDiv = screen.getByText('Log').closest('div') as HTMLElement
      expect(headerDiv).toHaveClass('bg-primary-600')
    })
  })

  test('switching sections updates the stored key', () => {
    renderAccordion()
    fireEvent.click(screen.getByText('Log'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('log')
    fireEvent.click(screen.getByText('Comms Queue'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('comms')
  })
})

test('queue count correctly mixes ack, sent, timeout, and queued commands', async () => {
  // 1 queued + 1 sent = 2 in queue; 1 ack + 1 timeout = 0 added
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: makeEvents([
            { eventId: 500, commsStatus: 'ack' },
            { eventId: 501, commsStatus: 'sent' },
            { eventId: 502, commsStatus: 'timeout' },
            { eventId: 503, commsStatus: 'queued' },
          ]),
        })
      )
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <VehicleAccordion {...props} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('2 item(s) in queue')).toBeInTheDocument()
  })
})
