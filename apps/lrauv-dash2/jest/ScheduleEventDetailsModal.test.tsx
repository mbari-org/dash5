import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ScheduleEventDetailsModal } from '../components/ScheduleEventDetailsModal'

// Mock hooks the modal depends on
jest.mock('../lib/useGlobalModalId', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('../lib/useCurrentDeployment', () => ({
  __esModule: true,
  default: jest.fn(() => ({ deployment: null })),
}))
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ query: {} })),
}))

import useGlobalModalId from '../lib/useGlobalModalId'

const baseEvent = {
  eventId: 1001,
  commandType: 'mission' as const,
  status: 'sent' as const,
  label: 'load Transport/transit.tl',
  user: 'test-operator',
  note: '[[via:cell, timeout:5min]]',
  eventData: 'load Transport/transit.tl;set transit.Depth 50 m;run',
  eventText: null,
  startedAt: Date.now() - 60 * 1000,
  vehicleName: 'triton',
  via: 'cell' as const,
}

const makeModalId = (event: object) => ({
  globalModalId: {
    id: 'scheduleEventDetails' as const,
    meta: { scheduleEvent: event },
  },
  setGlobalModalId: jest.fn(),
})

beforeEach(() => {
  jest.clearAllMocks()
})

// ── Summary Parameters visibility ─────────────────────────────────────────────

test('shows Summary Parameters for load+run mission with params', () => {
  ;(useGlobalModalId as jest.Mock).mockReturnValue(
    makeModalId({
      ...baseEvent,
      isLoadRunMission: true,
      secondary: 'set transit.Depth 50 m',
    })
  )

  render(<ScheduleEventDetailsModal onClose={() => {}} />)

  expect(screen.getByText(/Summary Parameters/i)).toBeInTheDocument()
  // The text appears in both Summary Parameters and Raw Payload sections.
  expect(screen.getAllByText('set transit.Depth 50 m').length).toBeGreaterThan(
    0
  )
  expect(
    screen.queryByText('No parsed parameters available')
  ).not.toBeInTheDocument()
})

test('shows "No parsed parameters available" for load+run mission with no params', () => {
  ;(useGlobalModalId as jest.Mock).mockReturnValue(
    makeModalId({
      ...baseEvent,
      isLoadRunMission: true,
      secondary: undefined,
    })
  )

  render(<ScheduleEventDetailsModal onClose={() => {}} />)

  expect(screen.getByText(/Summary Parameters/i)).toBeInTheDocument()
  expect(screen.getByText('No parsed parameters available')).toBeInTheDocument()
})

test('hides Summary Parameters for non-mission bare commands', () => {
  ;(useGlobalModalId as jest.Mock).mockReturnValue(
    makeModalId({
      ...baseEvent,
      commandType: 'command' as const,
      isLoadRunMission: false,
      isParamUpdate: false,
      isConfigSetUpdate: false,
      secondary: undefined,
      eventData: 'restart logs',
    })
  )

  render(<ScheduleEventDetailsModal onClose={() => {}} />)

  expect(screen.queryByText(/Summary Parameters/i)).not.toBeInTheDocument()
  expect(
    screen.queryByText('No parsed parameters available')
  ).not.toBeInTheDocument()
})

test('shows Summary Parameters with raw payload for isParamUpdate commands', () => {
  const rawCmd = 'set transit.Depth 50 m'
  ;(useGlobalModalId as jest.Mock).mockReturnValue(
    makeModalId({
      ...baseEvent,
      commandType: 'command' as const,
      isLoadRunMission: false,
      isParamUpdate: true,
      isConfigSetUpdate: false,
      secondary: rawCmd,
      eventData: rawCmd,
    })
  )

  render(<ScheduleEventDetailsModal onClose={() => {}} />)

  expect(screen.getByText(/Summary Parameters/i)).toBeInTheDocument()
  // secondary is now the raw command text — not the generic placeholder
  expect(
    screen.queryByText('No parsed parameters available')
  ).not.toBeInTheDocument()
  // The text appears in both Summary Parameters and Raw Payload sections.
  expect(screen.getAllByText(rawCmd).length).toBeGreaterThan(0)
})

test('hides Summary Parameters for legacy bare-run mission (commandType mission, isLoadRunMission false)', () => {
  // Command-status payloads can carry bare "run Science/mbts_sci2.tl" events
  // (no load prefix) — these are classified as commandType:'mission' but
  // isLoadRunMission is false because there is no load+run pair. The modal
  // must NOT show the Summary Parameters block for these legacy rows.
  ;(useGlobalModalId as jest.Mock).mockReturnValue(
    makeModalId({
      ...baseEvent,
      commandType: 'mission' as const,
      isLoadRunMission: false,
      isParamUpdate: false,
      isConfigSetUpdate: false,
      secondary: undefined,
      label: 'Science/mbts_sci2.tl',
      eventData: 'run Science/mbts_sci2.tl',
    })
  )

  render(<ScheduleEventDetailsModal onClose={() => {}} />)

  expect(screen.queryByText(/Summary Parameters/i)).not.toBeInTheDocument()
  expect(
    screen.queryByText('No parsed parameters available')
  ).not.toBeInTheDocument()
})

test('shows Summary Parameters with raw payload for isConfigSetUpdate commands', () => {
  const rawCmd = 'configSet CTD_Seabird.loadAtStartup 1 bool persist'
  ;(useGlobalModalId as jest.Mock).mockReturnValue(
    makeModalId({
      ...baseEvent,
      commandType: 'command' as const,
      isLoadRunMission: false,
      isParamUpdate: false,
      isConfigSetUpdate: true,
      secondary: rawCmd,
      eventData: rawCmd,
    })
  )

  render(<ScheduleEventDetailsModal onClose={() => {}} />)

  expect(screen.getByText(/Summary Parameters/i)).toBeInTheDocument()
  expect(
    screen.queryByText('No parsed parameters available')
  ).not.toBeInTheDocument()
  expect(screen.getAllByText(rawCmd).length).toBeGreaterThan(0)
})
