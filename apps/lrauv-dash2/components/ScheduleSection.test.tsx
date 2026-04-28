import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ScheduleSection, ScheduleSectionProps } from './ScheduleSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from './testHelpers'

const props: ScheduleSectionProps = {
  authenticated: true,
  vehicleName: 'example',
  currentDeploymentId: 1,
}

export const mockResponse = {
  result: [
    {
      deploymentId: 3000403,
      vehicleName: 'pontus',
      name: 'Pontus 24FishCAM',
      path: '2022-06-07',
      startEvent: { unixTime: 1656368134464, state: 1, eventId: 16926582 },
    },
  ],
}

const mockCommandStatusResponse = {
  result: {
    deploymentInfo: {},
    eventTypes: 'command,run',
    commandStatuses: [
      {
        status: 'pending',
        relatedEvents: [],
        event: {
          eventId: 99001,
          eventType: 'command',
          unixTime: 1656368134464,
          data: 'load Science/profiles.xml',
          note: '',
          user: 'test-user',
          text: '',
        },
      },
    ],
  },
}

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/deployments', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/deployments/commandStatus', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockCommandStatusResponse))
  }),
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: [] }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('should render the component', async () => {
  expect(() =>
    render(
      <MockProviders queryClient={new QueryClient()}>
        <ScheduleSection {...props} />
      </MockProviders>
    )
  ).not.toThrow()
})

test('pending items render as completed in deployment-logs view when isRecovered is true', async () => {
  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} isRecovered={true} />
    </MockProviders>
  )

  // Switch to deployment-logs-only mode
  await userEvent.click(
    await screen.findByRole('button', { name: /displaying all logs/i })
  )

  // With isRecovered=true, pending items are remapped to 'completed':
  // - the "Schedule History" heading appears (item moved to historicCells)
  // - the ScheduleCell renders a completed icon (title="completed")
  // - no pending icon is present
  await waitFor(() => {
    expect(screen.getByText(/schedule history/i)).toBeInTheDocument()
    expect(screen.getByTitle('completed')).toBeInTheDocument()
    expect(screen.queryByTitle('pending')).not.toBeInTheDocument()
  })
})

test('pending items remain pending in deployment-logs view when isRecovered is false', async () => {
  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} isRecovered={false} />
    </MockProviders>
  )

  // Switch to deployment-logs-only mode
  await userEvent.click(
    await screen.findByRole('button', { name: /displaying all logs/i })
  )

  // With isRecovered=false, items stay pending in scheduledCells:
  // - no "Schedule History" heading (no historicCells)
  // - the ScheduleCell renders a pending icon (title="pending")
  await waitFor(() => {
    expect(screen.queryByText(/schedule history/i)).not.toBeInTheDocument()
    expect(screen.getByTitle('pending')).toBeInTheDocument()
    expect(screen.queryByTitle('completed')).not.toBeInTheDocument()
  })
})

test('items with a server-side cancellation note render as cancelled', async () => {
  // Override /events to return a cancellation note for event 99001 when
  // the noteMatches param is set, mimicking TethysDash backend behaviour.
  server.use(
    rest.get('/events', (req, res, ctx) => {
      const noteMatches = req.url.searchParams.get('noteMatches')
      if (noteMatches?.includes('Cancelled request')) {
        return res(
          ctx.status(200),
          ctx.json({
            result: [
              {
                eventId: 89999,
                eventType: 'note',
                unixTime: 1656368200000,
                note: "Cancelled request 99001 for 'example': 'load Science/profiles.xml'",
                user: 'test-user',
              },
            ],
          })
        )
      }
      return res(ctx.status(200), ctx.json({ result: [] }))
    })
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} />
    </MockProviders>
  )

  // Switch to deployment-logs-only mode so the item comes from commandStatuses
  await userEvent.click(
    await screen.findByRole('button', { name: /displaying all logs/i })
  )

  // The cancellation override must stamp the item as 'cancelled' regardless
  // of what the timeline inferred (pending → cancelled via note eventId match).
  await waitFor(() => {
    expect(screen.getByTitle('cancelled')).toBeInTheDocument()
    expect(screen.queryByTitle('pending')).not.toBeInTheDocument()
    expect(screen.queryByTitle('completed')).not.toBeInTheDocument()
  })
})
