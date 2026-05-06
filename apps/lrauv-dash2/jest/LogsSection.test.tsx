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
const makeTimeoutNote = (eventId: number, chunkNum: number): object => ({
  eventId: eventId * 100 + chunkNum,
  vehicleName: 'triton',
  eventType: 'note',
  unixTime: Date.now() - 60 * 1000,
  isoTime: new Date(Date.now() - 60 * 1000).toISOString(),
  note: `id=${eventId}: Timeout while waiting for 'triton' to fetch command via cell: 'sched "chunk ${chunkNum}"'`,
  user: null,
  state: 0,
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
