import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient } from 'react-query'
import { MockProviders } from '../components/testHelpers'

// Controllable globalModalId for tests that exercise the auto-select path
let mockGlobalModalId: { id: string; meta?: Record<string, unknown> } | null =
  null

jest.mock('../lib/useGlobalModalId', () => ({
  __esModule: true,
  default: () => ({
    globalModalId: mockGlobalModalId,
    setGlobalModalId: jest.fn(),
  }),
}))

const matchingMission = {
  id: 'Science/sci2.tl',
  missionPath: 'Science/sci2.tl',
  category: 'Science',
  name: 'sci2',
  note: 'Test mission',
  description: 'Science mission',
  vehicle: 'tethys',
  ranBy: null,
  ranOn: null,
  recentRun: false,
  frequentRun: false,
}

jest.mock('../lib/useMissionData', () => ({
  useMissionData: () => ({
    recentRuns: [],
    allMissions: [matchingMission],
    selectedMissionData: null,
    isRecentRunsLoading: false,
    isFrequentRunsLoading: false,
    isMissionListLoading: false,
    missionCategories: [{ id: 'Recent Runs', name: 'Recent Runs' }],
  }),
}))

jest.mock('../lib/useInsertTempMission', () => ({
  useInsertTempMission: ({ missions }: { missions: unknown[] }) => missions,
}))

jest.mock('@mbari/api-client', () => ({
  ...jest.requireActual('@mbari/api-client'),
  useSiteConfig: () => ({ data: { vehicleNames: ['tethys'] } }),
  useSbdOutgoingAlternativeAddresses: () => ({ data: [] }),
  useUnits: () => ({ data: undefined }),
  useCreateCommand: () => ({ mutate: jest.fn(), isLoading: false }),
  useTethysApiContext: () => ({ axiosInstance: null, token: null }),
  getPreview: jest.fn(),
  countPreviewSbdChunks: jest.fn(),
}))

jest.mock('../lib/useGlobalDrawerState', () => ({
  __esModule: true,
  default: () => ({ drawerOpen: false, setDrawerOpen: jest.fn() }),
}))

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { deployment: ['tethys', '1'] },
    push: jest.fn(),
  }),
}))

jest.mock('../lib/useParameterOverrides', () => ({
  useParameterOverrides: () => ({
    parameters: [],
    safetyParams: [],
    commsParams: [],
    parametersWithOverrides: [],
    commsParamsWithOverrides: [],
    safetyParamsWithOverrides: [],
  }),
}))

jest.mock('../lib/useWaypointCalculations', () => ({
  useWaypointCalculations: () => ({ estDistance: null }),
}))

jest.mock('@mbari/react-ui', () => {
  const actual = jest.requireActual('@mbari/react-ui')
  return {
    ...actual,
    useManagedWaypoints: () => ({
      handleWaypointsUpdate: jest.fn(),
      updatedWaypoints: [],
    }),
    useStations: () => ({ data: [] }),
  }
})

import MissionModal from '../components/MissionModal'

beforeEach(() => {
  mockGlobalModalId = null
})

describe('MissionModal', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(
        <MockProviders queryClient={new QueryClient()}>
          <MissionModal onClose={jest.fn()} />
        </MockProviders>
      )
    ).not.toThrow()
  })

  it('opens on the Mission selection step (step 0) by default', () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MissionModal onClose={jest.fn()} />
      </MockProviders>
    )
    expect(screen.getAllByText('1. Mission')[0]).toBeInTheDocument()
  })

  it('advances to the Waypoints step after "Use for new mission" auto-selects a matching mission', async () => {
    mockGlobalModalId = {
      id: 'newMission',
      meta: { mission: 'Science/sci2.tl' },
    }
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MissionModal onClose={jest.fn()} />
      </MockProviders>
    )
    // After auto-select fires, the modal advances to step 1 (Waypoints)
    await waitFor(() => {
      expect(
        screen.getByText(/Set up to 0 waypoints for Tethys/i)
      ).toBeInTheDocument()
    })
  })
})
