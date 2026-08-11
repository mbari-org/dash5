import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import toast from 'react-hot-toast'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

jest.mock('@mbari/react-ui', () => {
  const actual = jest.requireActual('@mbari/react-ui')
  return {
    ...actual,
    MissionModalView: (props: {
      currentStepIndex?: number
      selectedId?: string
      previewText?: string
      defaultOverrides?: unknown
    }) => (
      <div
        data-testid="mission-modal-view"
        data-step={String(props.currentStepIndex ?? 0)}
        data-selected={props.selectedId ?? ''}
        data-preview={props.previewText ?? ''}
        data-has-overrides={
          Array.isArray(props.defaultOverrides) &&
          props.defaultOverrides.length > 0
            ? 'true'
            : 'false'
        }
      />
    ),
    useManagedWaypoints: () => ({
      handleWaypointsUpdate: jest.fn(),
      updatedWaypoints: [],
    }),
  }
})

jest.mock('@mbari/api-client', () => ({
  useUnits: () => ({ data: [] }),
  useStations: () => ({ data: [] }),
  useSbdOutgoingAlternativeAddresses: () => ({ data: [] }),
  useCreateCommand: () => ({ mutate: jest.fn(), isLoading: false }),
  useSiteConfig: () => ({ data: { vehicleNames: ['daphne'] } }),
  getVia: () => 'cellsat',
  timeoutRegEx: /timeout\s+(\d+)/i,
}))

jest.mock('../lib/useGlobalDrawerState', () => ({
  __esModule: true,
  default: () => ({ drawerOpen: false, setDrawerOpen: jest.fn() }),
}))

jest.mock('../lib/useWaypointCalculations', () => ({
  useWaypointCalculations: () => ({ estDistance: undefined }),
}))

jest.mock('../lib/useParameterOverrides', () => ({
  useParameterOverrides: () => ({
    parameters: [],
    safetyParams: [],
    commsParams: [],
    parametersWithOverrides: [{ name: 'MissionTimeout', overrideValue: '12' }],
    commsParamsWithOverrides: [],
    safetyParamsWithOverrides: [],
  }),
}))

jest.mock('../lib/useInsertTempMission', () => ({
  useInsertTempMission: ({ missions }: { missions: unknown[] }) => missions,
}))

jest.mock('../lib/useMissionData')
jest.mock('../lib/useGlobalModalId')

import { useMissionData } from '../lib/useMissionData'
import useGlobalModalId from '../lib/useGlobalModalId'
import MissionModal from '../components/MissionModal'

const MISSION_PATH = 'Science/profile_station.tl'

const baseMission = {
  id: MISSION_PATH,
  missionPath: MISSION_PATH,
  category: 'Science',
  name: 'profile_station',
  recentRun: true,
  parameterOverrides: [{ name: 'MissionTimeout', value: '12' }],
}

const scriptData = {
  id: 'profile_station',
  scriptArgs: [{ name: 'MissionTimeout', value: '24' }],
  latLonNamePairs: [],
  inserts: [],
}

const mockMissionData = (overrides: Record<string, unknown> = {}) => {
  ;(useMissionData as jest.Mock).mockReturnValue({
    recentRuns: [baseMission],
    allMissions: [baseMission],
    selectedMissionData: undefined,
    isSelectedMissionLoading: false,
    isSelectedMissionError: false,
    isRecentRunsLoading: false,
    isFrequentRunsLoading: false,
    isMissionListLoading: false,
    missionCategories: [{ id: 'Science', name: 'Science' }],
    frequentRuns: [],
    ...overrides,
  })
}

const mockSendAgainModal = (
  meta: Record<string, unknown> = {
    sendAgain: true,
    mission: MISSION_PATH,
    eventData:
      'load Science/profile_station.tl;set profile_station.MissionTimeout 12 h;run',
  }
) => {
  ;(useGlobalModalId as jest.Mock).mockReturnValue({
    globalModalId: { id: 'newMission', meta },
    setGlobalModalId: jest.fn(),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSendAgainModal()
  mockMissionData()
})

test('Send again shows loading until getScript data is available', async () => {
  const onClose = jest.fn()
  mockMissionData({ selectedMissionData: undefined })

  render(<MissionModal onClose={onClose} />)

  expect(
    await screen.findByRole('status', {
      name: /loading mission to send again/i,
    })
  ).toBeInTheDocument()
  expect(screen.queryByTestId('mission-modal-view')).not.toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
})

test('Send again mounts wizard on Send Command once script data loads', async () => {
  mockMissionData({ selectedMissionData: scriptData })

  render(<MissionModal onClose={jest.fn()} />)

  const view = await screen.findByTestId('mission-modal-view')
  expect(view).toHaveAttribute('data-step', '7')
  expect(view).toHaveAttribute('data-selected', MISSION_PATH)
  expect(view.getAttribute('data-preview')).toMatch(/profile_station/)
  expect(view).toHaveAttribute('data-has-overrides', 'true')
})

test('Send again stays on loading UI when lists are still fetching', () => {
  mockMissionData({
    isRecentRunsLoading: true,
    selectedMissionData: scriptData,
  })

  render(<MissionModal onClose={jest.fn()} />)

  expect(
    screen.getByRole('status', { name: /loading mission to send again/i })
  ).toBeInTheDocument()
  expect(screen.queryByTestId('mission-modal-view')).not.toBeInTheDocument()
})

test('Send again aborts when mission is missing after lists settle', async () => {
  const onClose = jest.fn()
  mockMissionData({
    recentRuns: [],
    allMissions: [],
    selectedMissionData: undefined,
  })

  render(<MissionModal onClose={onClose} />)

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      'Could not find that mission to send again'
    )
  })
  expect(onClose).toHaveBeenCalled()
  expect(screen.queryByTestId('mission-modal-view')).not.toBeInTheDocument()
})

test('Send again aborts when getScript fails', async () => {
  const onClose = jest.fn()
  mockMissionData({
    selectedMissionData: undefined,
    isSelectedMissionError: true,
  })

  render(<MissionModal onClose={onClose} />)

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      'Could not load mission definition for Send again'
    )
  })
  expect(onClose).toHaveBeenCalled()
})

test('normal (non send-again) open mounts the wizard immediately', async () => {
  ;(useGlobalModalId as jest.Mock).mockReturnValue({
    globalModalId: { id: 'newMission', meta: {} },
    setGlobalModalId: jest.fn(),
  })
  mockMissionData({ selectedMissionData: undefined })

  render(<MissionModal onClose={jest.fn()} />)

  const view = await screen.findByTestId('mission-modal-view')
  expect(view).toHaveAttribute('data-step', '0')
  expect(
    screen.queryByRole('status', { name: /loading mission to send again/i })
  ).not.toBeInTheDocument()
})
