import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
// 'queued'  → command with no sbdSend
// 'sent'    → command + sbdSend (sat, no sbdReceive)
// 'ack'     → command + sbdSend state:2 (cell instant-ack)
// 'timeout' → command + timeout note
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
      note: '[[via:cell, timeout:5min]]',
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
