import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import {
  ScheduleSection,
  ScheduleSectionProps,
  isMissionCommand,
  isParamCommand,
  isConfigSetCommand,
  parseMissionCommand,
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
afterEach(() => {
  server.resetHandlers()
  jest.restoreAllMocks()
})
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
  let noteCalled = false
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Science/profiles.xml run',
              unixTime: Date.now() - 60 * 1000,
              eventId: 99001,
              eventType: 'run',
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
    }),
    rest.post('/events/note', (_req, res, ctx) => {
      noteCalled = true
      return res(ctx.status(200), ctx.json({ result: {} }))
    })
  )
  jest.spyOn(window, 'confirm').mockReturnValueOnce(true)

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  const user = userEvent.setup()
  const moreButton = await screen.findByRole('button', {
    name: /more options/i,
  })
  await user.click(moreButton)
  await user.click(await screen.findByText('Cancel this Directive'))

  await waitFor(() => {
    expect(deleteCalled).toBe(true)
    expect(noteCalled).toBe(true)
  })
})

test('Schedule History header and search input stay visible when search matches nothing', async () => {
  // Set up a completed historic mission: profile_station is older than the
  // currently-running keepstation, so the mission timeline marks it completed.
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Science/profile_station.tl;run',
              unixTime: Date.now() - 120 * 1000,
              eventId: 101,
              eventType: 'run',
              text: null,
              note: null,
              user: 'test-user',
            },
          ],
        })
      )
    ),
    rest.get('/events/mission-started', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: missionStartedWithHistory }))
    )
  )

  const user = userEvent.setup()

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  // Wait for the Schedule History header to appear (completed item present).
  await waitFor(() => {
    expect(screen.getByText(/schedule history/i)).toBeInTheDocument()
  })

  // Type a term that matches nothing — previously this removed the header row.
  await user.type(screen.getByPlaceholderText('Search'), 'xyzzy-no-match')

  // The header row (including the search input) must survive a zero-match search.
  await waitFor(() => {
    expect(screen.getByText(/schedule history/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })
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
              data: 'load Science/profiles.xml run',
              unixTime: Date.now() - 60 * 1000,
              eventId: 99001,
              eventType: 'run',
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
    }),
    rest.post('/events/note', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: {} }))
    )
  )
  jest.spyOn(window, 'confirm').mockReturnValueOnce(false)

  render(
    <MockProviders queryClient={new QueryClient()}>
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  const user = userEvent.setup()
  const moreButton = await screen.findByRole('button', {
    name: /more options/i,
  })
  await user.click(moreButton)
  await user.click(await screen.findByText('Cancel this Directive'))

  // Menu closes; confirm was dismissed so DELETE must never fire
  await waitFor(() =>
    expect(screen.queryByText('Cancel this Directive')).not.toBeInTheDocument()
  )
  expect(deleteCalled).toBe(false)
})

// ── isParamCommand unit tests ────────────────────────────────────────────────

test('isParamCommand returns true for "set <mission>.<param> <value>"', () => {
  expect(isParamCommand('set profile_station.YoYoMaxDepth 40 meter')).toBe(true)
  expect(isParamCommand('set sci2.Lat1 36.87 degree')).toBe(true)
  expect(isParamCommand('  set keepstation.Radius 200 meter')).toBe(true)
})

test('isParamCommand returns false for non-param commands', () => {
  expect(
    isParamCommand(
      'configSet VerticalControl.massDefault -16 millimeter persist'
    )
  ).toBe(false)
  expect(isParamCommand('load Science/profile_station.tl;run')).toBe(false)
  expect(isParamCommand('sched resume')).toBe(false)
  expect(isParamCommand('gfscan')).toBe(false)
})

// ── isConfigSetCommand unit tests ────────────────────────────────────────────

test('isConfigSetCommand returns true for "configSet <subsystem>.<param>"', () => {
  expect(
    isConfigSetCommand(
      'configSet VerticalControl.massDefault -16 millimeter persist'
    )
  ).toBe(true)
  expect(
    isConfigSetCommand('configSet CTD_Seabird.loadAtStartup 1 bool persist')
  ).toBe(true)
  expect(
    isConfigSetCommand(
      '  configSet RDI_Pathfinder.loadAtStartup 1 bool persist'
    )
  ).toBe(true)
})

test('isConfigSetCommand returns true for non-dotted configSet commands', () => {
  expect(
    isConfigSetCommand(
      'configSet Express linearApproximation acoustic_receive_time ampere_hour persist'
    )
  ).toBe(true)
})

test('isConfigSetCommand returns false for non-configSet commands and configSet list', () => {
  expect(isConfigSetCommand('set profile_station.YoYoMaxDepth 40 meter')).toBe(
    false
  )
  expect(isConfigSetCommand('load Science/profile_station.tl;run')).toBe(false)
  expect(isConfigSetCommand('sched resume')).toBe(false)
  expect(isConfigSetCommand('configSet list')).toBe(false)
  expect(isConfigSetCommand('  configSet list  ')).toBe(false)
})

// ── configSet integration test ───────────────────────────────────────────────

test('configSet command row shows Sent status and config badge tooltip', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'configSet VerticalControl.massDefault -16 millimeter persist',
              unixTime: Date.now() - 60 * 1000,
              eventId: 300,
              eventType: 'command',
              text: null,
              note: null,
              user: 'test-engineer',
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
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  // configSet is an instantaneous one-shot — its verb must be 'Sent', not 'Ran'
  await waitFor(() => {
    expect(screen.getByText(/^Sent /i)).toBeInTheDocument()
  })

  // The blue-variant badge renders the faWrench icon (data-icon="wrench")
  await waitFor(() => {
    const wrenchIcon = document.querySelector('svg[data-icon="wrench"]')
    expect(wrenchIcon).toBeInTheDocument()
  })
})

// ── isMissionCommand unit tests ───────────────────────────────────────────────

test('isMissionCommand returns true for load+run commands', () => {
  expect(
    isMissionCommand(
      'load Science/profile_station.tl;set profile_station.NeedCommsTime 30 min;run'
    )
  ).toBe(true)
  expect(isMissionCommand('load Transport/transit.tl;run')).toBe(true)
  expect(isMissionCommand(undefined, 'load Science/sci2.xml;run')).toBe(true)
})

test('isMissionCommand returns false for commands without load+run', () => {
  expect(isMissionCommand('restart logs')).toBe(false)
  expect(isMissionCommand('schedule clear;schedule resume')).toBe(false)
  expect(isMissionCommand('set profile_station.YoYoMaxDepth 40 meter')).toBe(
    false
  )
  expect(
    isMissionCommand('configSet CTD_Seabird.loadAtStartup 1 bool persist')
  ).toBe(false)
  expect(isMissionCommand('schedule clear')).toBe(false)
  expect(isMissionCommand(undefined, undefined)).toBe(false)
})

// ── secondary label gating integration tests ──────────────────────────────────

test('bare command row does not show "No parameters" secondary text', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'restart logs',
              unixTime: Date.now() - 60 * 1000,
              eventId: 400,
              eventType: 'command',
              text: null,
              note: null,
              user: 'test-operator',
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
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('restart logs')).toBeInTheDocument()
  })
  expect(screen.queryByText('No parameters')).not.toBeInTheDocument()
  expect(
    screen.queryByText('No parsed parameters available')
  ).not.toBeInTheDocument()
})

test('mission command row shows "No parameters" secondary text when no params set', async () => {
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'load Transport/transit.tl;run',
              unixTime: Date.now() - 60 * 1000,
              eventId: 401,
              eventType: 'run',
              text: null,
              note: null,
              user: 'test-operator',
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
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText('load Transport/transit.tl')).toBeInTheDocument()
  })
  expect(screen.getByText('No parameters')).toBeInTheDocument()
})

// ── parseMissionCommand unit tests (#585) ─────────────────────────────────────

test('parseMissionCommand strips trailing run from semicolon-delimited commands', () => {
  // load;run with no set params should return parameters: undefined so the
  // row falls back to "No parameters" rather than showing "run" as a param.
  expect(parseMissionCommand('load Transport/transit.tl;run')).toEqual({
    name: 'load Transport/transit.tl',
    parameters: undefined,
  })
})

test('parseMissionCommand preserves set params between load and run', () => {
  expect(
    parseMissionCommand('load Transport/transit.tl;set transit.Depth 50 m;run')
  ).toEqual({
    name: 'load Transport/transit.tl',
    parameters: 'set transit.Depth 50 m',
  })
})

test('parseMissionCommand strips bare sched/asap tokens', () => {
  expect(
    parseMissionCommand('sched asap load Science/profile_station.tl;run')
  ).toEqual({
    name: 'load Science/profile_station.tl',
    parameters: undefined,
  })
})

// ── Legacy run <file> — no parameter summary row (#585) ───────────────────────

test('legacy run <file> mission row does not show "No parameters" subtitle', async () => {
  // Legacy format: eventType 'run' but command data is bare 'run <file>'.
  // isMission is true (eventType=run), but isLoadRunMission is false (no load),
  // so the secondary text should be suppressed entirely.
  server.use(
    rest.get('/events', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: [
            {
              data: 'run Science/mbts_sci2.tl',
              unixTime: Date.now() - 60 * 1000,
              eventId: 410,
              eventType: 'run',
              text: null,
              note: null,
              user: 'test-operator',
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
      <ScheduleSection {...props} currentDeploymentId={1} />
    </MockProviders>
  )

  await waitFor(() => {
    expect(screen.getByText(/mbts_sci2/)).toBeInTheDocument()
  })
  expect(screen.queryByText('No parameters')).not.toBeInTheDocument()
})
