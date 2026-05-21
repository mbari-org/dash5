import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LogsSection from '../components/LogsSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../components/testHelpers'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => res(ctx.status(200), ctx.json({})))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const renderLogs = (events: object[]) => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: events }))
    )
  )
  render(
    <MockProviders queryClient={new QueryClient()}>
      <LogsSection
        vehicleName="triton"
        from={0}
        deploymentLogsOnly={false}
        setDeploymentLogsOnly={() => {}}
      />
    </MockProviders>
  )
}

// Helpers to build note events for tests
const makeTimeoutNote = (eventId: number, chunkNum: number): object => {
  const ts = Date.now() - 60 * 1000
  return {
    eventId: eventId * 100 + chunkNum,
    vehicleName: 'triton',
    eventType: 'note',
    unixTime: ts,
    isoTime: new Date(ts).toISOString(),
    note: `id=${eventId}: Timeout while waiting for 'triton' to fetch command via cell: 'sched "chunk ${chunkNum}"'`,
    user: null,
    state: 0,
  }
}

// ── Auto-refresh / relative timestamp tests (#627) ────────────────────────────

test('shows "Updated ... ago" in toolbar after a successful data load', async () => {
  renderLogs([makeTimeoutNote(1, 1)])

  await waitFor(() => {
    expect(screen.getByText(/Updated .+ ago/)).toBeInTheDocument()
  })
})

test('shows timeAgo for events within the last 7 days', async () => {
  const ts = Date.now() - 3 * 24 * 60 * 60 * 1000
  renderLogs([
    {
      eventId: 5001,
      vehicleName: 'triton',
      eventType: 'note',
      unixTime: ts,
      isoTime: new Date(ts).toISOString(),
      note: 'Some 3-day-old event',
      user: null,
      state: 0,
    },
  ])

  await waitFor(() => {
    // Should render a relative duration like "3d 0h ago" or "2d 23h ago"
    expect(screen.getByText(/\d+d.+ago/)).toBeInTheDocument()
  })
})

test('hides timeAgo for events older than 7 days', async () => {
  const ts = Date.now() - 8 * 24 * 60 * 60 * 1000
  renderLogs([
    {
      eventId: 5002,
      vehicleName: 'triton',
      eventType: 'note',
      unixTime: ts,
      isoTime: new Date(ts).toISOString(),
      note: 'Some 8-day-old event',
      user: null,
      state: 0,
    },
  ])

  await waitFor(() => {
    expect(screen.getByText(/Note/i)).toBeInTheDocument()
  })
  // 8 days old → no timeAgo chip should appear
  expect(screen.queryByText(/\d+d.+ago/)).not.toBeInTheDocument()
})

// ── Grouping regression tests (#596) ──────────────────────────────────────────

test('single timeout note renders normally (no grouping needed)', async () => {
  renderLogs([makeTimeoutNote(500, 1)])

  await waitFor(() => {
    expect(screen.getByText(/Note/i)).toBeInTheDocument()
  })
  // No "N timeout notes" badge should appear for a single note
  expect(screen.queryByText(/timeout notes/i)).not.toBeInTheDocument()
})

test('multiple timeout notes with the same event ID are collapsed into one row', async () => {
  // 6 chunks timed out → 6 note events with id=27107237 in the API response
  const events = [1, 2, 3, 4, 5, 6].map((n) => makeTimeoutNote(27107237, n))
  renderLogs(events)

  await waitFor(() => {
    // A badge showing the group size should appear
    expect(screen.getByText(/6 timeout notes/i)).toBeInTheDocument()
  })

  // Only ONE "Note" label row should be in the log (not 6)
  const noteLabels = screen.getAllByText(/^Note$/)
  expect(noteLabels).toHaveLength(1)
})

test('expanded group shows all chunk notes', async () => {
  const events = [1, 2, 3].map((n) => makeTimeoutNote(100, n))
  renderLogs(events)

  await waitFor(() => {
    expect(screen.getByText(/3 timeout notes/i)).toBeInTheDocument()
  })

  // Initially only the first chunk text is visible
  expect(screen.queryByText(/chunk 2/i)).not.toBeInTheDocument()

  // Click "Expand all"
  fireEvent.click(screen.getByRole('button', { name: /expand all/i }))

  await waitFor(() => {
    expect(screen.getByText(/chunk 2/i)).toBeInTheDocument()
    expect(screen.getByText(/chunk 3/i)).toBeInTheDocument()
  })
})

test('collapse hides chunk notes again after expanding', async () => {
  const events = [1, 2].map((n) => makeTimeoutNote(200, n))
  renderLogs(events)

  await waitFor(() => {
    expect(screen.getByText(/2 timeout notes/i)).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: /expand all/i }))
  await waitFor(() => {
    expect(screen.getByText(/chunk 2/i)).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: /collapse/i }))
  await waitFor(() => {
    expect(screen.queryByText(/chunk 2/i)).not.toBeInTheDocument()
  })
})

test('notes with different event IDs are kept as separate rows', async () => {
  // Two separate command IDs each with 2 timeout notes → 2 grouped rows
  const events = [
    ...[1, 2].map((n) => makeTimeoutNote(300, n)),
    ...[1, 2].map((n) => makeTimeoutNote(301, n)),
  ]
  renderLogs(events)

  await waitFor(() => {
    const badges = screen.getAllByText(/2 timeout notes/i)
    expect(badges).toHaveLength(2)
  })
})

// ── Color / bold wiring tests (#640) ──────────────────────────────────────────

test('renders Fault label in amber with bold styling', async () => {
  const ts = Date.now() - 60 * 1000
  renderLogs([
    {
      eventId: 6001,
      vehicleName: 'triton',
      eventType: 'logFault',
      unixTime: ts,
      isoTime: new Date(ts).toISOString(),
      name: 'BuoyancyServo',
      text: 'uart error',
      user: null,
      state: 0,
    },
  ])

  await waitFor(() => {
    const label = screen.getByText('Fault')
    expect(label).toHaveStyle({ color: '#c78204' })
    expect(label).toHaveClass('font-bold')
  })
})

test('renders GPS Fix label in blue with bold styling', async () => {
  const ts = Date.now() - 60 * 1000
  renderLogs([
    {
      eventId: 6002,
      vehicleName: 'triton',
      eventType: 'gpsFix',
      unixTime: ts,
      isoTime: new Date(ts).toISOString(),
      fix: { latitude: 36.8, longitude: -121.9 },
      user: null,
      state: 0,
    },
  ])

  await waitFor(() => {
    const label = screen.getByText('GPS Fix')
    expect(label).toHaveStyle({ color: '#0000ff' })
    expect(label).toHaveClass('font-bold')
  })
})

test('timeout notes for same event ID outside the time window are NOT grouped', async () => {
  // Regression for Copilot review: grouping must be time-bounded so a timeout
  // note from a later incident (same event ID, far apart in time) doesn't get
  // silently swallowed into an earlier group and disappear from the timeline.
  const now = Date.now()
  const recentNote = {
    eventId: 9001,
    vehicleName: 'triton',
    eventType: 'note',
    unixTime: now - 30 * 1000,
    isoTime: new Date(now - 30 * 1000).toISOString(),
    note: 'id=400: Timeout while waiting for triton to fetch command via cell',
    user: null,
    state: 0,
  }
  // 10 minutes later (well outside the 5-second window) — should NOT be folded into the same group
  const oldNote = {
    eventId: 9002,
    vehicleName: 'triton',
    eventType: 'note',
    unixTime: now - 10 * 60 * 1000,
    isoTime: new Date(now - 10 * 60 * 1000).toISOString(),
    note: 'id=400: Timeout while waiting for triton to fetch command via cell',
    user: null,
    state: 0,
  }

  renderLogs([recentNote, oldNote])

  await waitFor(() => {
    // Two Note rows should be visible — not grouped, since they're 10 min apart (> 5s window)
    const noteLabels = screen.getAllByText(/^Note$/)
    expect(noteLabels).toHaveLength(2)
    // No group badge should appear
    expect(screen.queryByText(/timeout notes/i)).not.toBeInTheDocument()
  })
})
