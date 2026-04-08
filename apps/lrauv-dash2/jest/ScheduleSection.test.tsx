import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
    rest.get('/deployments/commandStatus', (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ result: runningMissionCommandStatus }))
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

  await waitFor(() => {
    expect(screen.queryByText(/profile_station/i)).not.toBeNull()
  })
})

test('injects a synthetic running row when no command event matches current mission', async () => {
  server.use(
    rest.get('/deployments/commandStatus', (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          result: {
            eventTypes: 'command',
            commandStatuses: [
              {
                event: {
                  data: 'sched resume',
                  unixTime: Date.now() - 200 * 1000,
                  eventId: 99,
                  eventType: 'command',
                  text: null,
                },
                status: 'completed',
              },
            ],
          },
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

  // Running row shows "Ended: TBD" for its description2.
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

  // Running mission shows "Ended: TBD"; completed mission shows an approximate end time.
  await waitFor(() => {
    expect(screen.getByText(/Ended:\s*TBD/i)).toBeInTheDocument()
    expect(screen.getByText(/Ended:.*~/i)).toBeInTheDocument()
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
