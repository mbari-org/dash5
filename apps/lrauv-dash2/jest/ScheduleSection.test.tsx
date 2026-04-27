import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import {
  ScheduleSection,
  ScheduleSectionProps,
} from '../components/ScheduleSection'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../components/testHelpers'

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

// A command-status payload representing a running mission.
const runningMissionCommandStatus = {
  eventTypes: 'command,run',
  commandStatuses: [
    {
      event: {
        data: 'load Science/profile_station.tl;set profile_station.MissionTimeout 12 h;run',
        unixTime: Date.now() - 60 * 1000,
        eventId: 101,
        eventType: 'run',
        text: null,
      },
      status: 'TBD',
    },
  ],
}

// A mission-started event for the same mission.
const missionStartedRunning = [
  {
    eventId: 201,
    eventType: 'missionStarted',
    vehicleName: 'example',
    unixTime: Date.now() - 50 * 1000,
    isoTime: new Date(Date.now() - 50 * 1000).toISOString(),
    fix: { latitude: 0, longitude: 0 },
    state: 1,
    dataLen: 0,
    refId: 0,
    index: 0,
    component: '',
    text: 'Started mission profile_station',
  },
]

// Two mission-started events: one completed, one running (newer).
const missionStartedWithHistory = [
  {
    eventId: 301,
    eventType: 'missionStarted',
    vehicleName: 'example',
    unixTime: Date.now() - 30 * 1000,
    isoTime: new Date(Date.now() - 30 * 1000).toISOString(),
    fix: { latitude: 0, longitude: 0 },
    state: 1,
    dataLen: 0,
    refId: 0,
    index: 0,
    component: '',
    text: 'Started mission keepstation',
  },
  {
    eventId: 201,
    eventType: 'missionStarted',
    vehicleName: 'example',
    unixTime: Date.now() - 120 * 1000,
    isoTime: new Date(Date.now() - 120 * 1000).toISOString(),
    fix: { latitude: 0, longitude: 0 },
    state: 1,
    dataLen: 0,
    refId: 0,
    index: 0,
    component: '',
    text: 'Started mission profile_station',
  },
]

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/deployments', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/events/mission-started', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: [] }))
  }),
  rest.get('/events', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: [] }))
  }),
  rest.get('/deployments/commandStatus', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ result: { eventTypes: 'command,run', commandStatuses: [] } })
    )
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

test('marks a mission as running when mission-started event matches a command event', async () => {
  server.use(
    // missions are sourced from /events (deploymentLogsOnly defaults to false)
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Science/profile_station.tl;set profile_station.MissionTimeout 12 h;run',
              unixTime: Date.now() - 60 * 1000,
              eventId: 101,
              eventType: 'run',
              text: null,
              note: null,
              user: null,
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: missionStartedRunning }))
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  // The profile_station event is enriched as running — description2 = "Ended: TBD"
  await waitFor(() => {
    expect(screen.getByText(/Ended:\s*TBD/i)).toBeInTheDocument()
  })
})

test('injects a synthetic running row when no command event matches current mission', async () => {
  server.use(
    // /events contains a non-matching command — no event maps to the running mission
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'sched resume',
              unixTime: Date.now() - 200 * 1000,
              eventId: 99,
              eventType: 'command',
              text: null,
              note: null,
              user: null,
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: missionStartedRunning }))
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  // A synthetic running row is injected for profile_station — shows "Ended: TBD"
  await waitFor(() => {
    expect(screen.getByText(/Ended:\s*TBD/i)).toBeInTheDocument()
  })
})

test('classifies older mission as completed when a newer mission-started event exists', async () => {
  server.use(
    rest.get('/deployments/commandStatus', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: runningMissionCommandStatus }))
    ),
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Science/profile_station.tl;run',
              unixTime: Date.now() - 60 * 1000,
              eventId: 101,
              eventType: 'run',
              text: null,
              note: null,
              user: null,
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: missionStartedWithHistory }))
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  // Running mission shows "Ended: TBD"; completed profile_station is not also running.
  // Note: the completed row renders outside the virtual viewport in JSDOM so we verify
  // its *absence* from the running zone — exactly one "Ended: TBD" must be present.
  await waitFor(() => {
    const tbdItems = screen.getAllByText(/Ended:\s*TBD/i)
    expect(tbdItems).toHaveLength(1)
  })
})

test('handles mission-started events with missing text gracefully', async () => {
  server.use(
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              ...missionStartedRunning[0],
              text: null,
            },
          ],
        })
      )
    )
  )

  expect(() =>
    render(
      <MockProviders queryClient={new QueryClient()}>
        <ScheduleSection {...props} />
      </MockProviders>
    )
  ).not.toThrow()
})
// Pure function tests for missionNameFromStartedText and missionNameFromEventData
// live in jest/missionUtils.test.ts where they run without React component overhead.

test('shows "Received by" tooltip when a non-mission command is acked via cell comms', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            // Non-mission command (gfscan) that was sent
            {
              data: 'gfscan',
              unixTime: Date.now() - 90 * 1000,
              eventId: 500,
              eventType: 'command',
              text: null,
              note: null,
              user: null,
            },
            // sbdSend event with refId matching the command's eventId and state:2 (cell = instant ack)
            {
              eventId: 600,
              eventType: 'sbdSend',
              refId: 500,
              state: 2,
              unixTime: Date.now() - 88 * 1000,
              isoTime: new Date(Date.now() - 88 * 1000).toISOString(),
              data: null,
              text: null,
              note: null,
              user: null,
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: [] }))
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection
        {...props}
        currentDeploymentId={1}
        deploymentStartTime={Date.now() - 3600 * 1000}
      />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByTitle(/Received by example/i)).toBeInTheDocument()
  })
})

test('shows timeout icon when a non-mission cell command times out', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            // Non-mission command with timeout note for cell comms
            {
              data: 'gfscan',
              unixTime: Date.now() - 90 * 1000,
              eventId: 700,
              eventType: 'command',
              text: null,
              note: '[timeout:30min via:cell]',
              user: null,
            },
            // note event signalling timeout for eventId 700
            {
              eventId: 800,
              eventType: 'note',
              unixTime: Date.now() - 60 * 1000,
              isoTime: new Date(Date.now() - 60 * 1000).toISOString(),
              data: null,
              text: null,
              note: 'id=700: Timeout while waiting for ack',
              user: null,
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: [] }))
    )
  )

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection
        {...props}
        currentDeploymentId={1}
        deploymentStartTime={Date.now() - 3600 * 1000}
      />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByTitle(/timeout/i)).toBeInTheDocument()
  })
})

test('Cancel this Directive calls DELETE /commands/queue when confirmed', async () => {
  let deleteCalled = false
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Science/profiles.xml',
              unixTime: Date.now() - 60 * 1000,
              eventId: 99001,
              eventType: 'command',
              text: null,
              note: null,
              user: 'test-user',
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: [] }))
    ),
    rest.delete('/commands/queue', (_req, res, ctx) => {
      deleteCalled = true
      return res(ctx.status(200), ctx.json({ result: 'ok' }))
    })
  )
  jest.spyOn(window, 'confirm').mockReturnValueOnce(true)

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  const moreButton = await screen.findByRole('button', {
    name: /more options/i,
  })
  await userEvent.click(moreButton)
  await userEvent.click(await screen.findByText('Cancel this Directive'))

  await waitFor(() => expect(deleteCalled).toBe(true))
})

test('Cancel this Directive does not call DELETE when confirm is dismissed', async () => {
  let deleteCalled = false
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Science/profiles.xml',
              unixTime: Date.now() - 60 * 1000,
              eventId: 99001,
              eventType: 'command',
              text: null,
              note: null,
              user: 'test-user',
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: [] }))
    ),
    rest.delete('/commands/queue', (_req, res, ctx) => {
      deleteCalled = true
      return res(ctx.status(200), ctx.json({ result: 'ok' }))
    })
  )
  jest.spyOn(window, 'confirm').mockReturnValueOnce(false)

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  const moreButton = await screen.findByRole('button', {
    name: /more options/i,
  })
  await userEvent.click(moreButton)
  await userEvent.click(await screen.findByText('Cancel this Directive'))

  await new Promise((r) => setTimeout(r, 100))
  expect(deleteCalled).toBe(false)
})
