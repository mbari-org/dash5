import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient } from 'react-query'
import { MockProviders } from '../components/testHelpers'

jest.mock('../lib/useMissionData', () => ({
  useMissionData: () => ({
    recentRuns: [],
    allMissions: [],
    selectedMissionData: null,
    isRecentRunsLoading: false,
    isFrequentRunsLoading: false,
    isMissionListLoading: false,
    missionCategories: [{ id: 'Recent Runs', name: 'Recent Runs' }],
  }),
}))

jest.mock('../lib/useInsertTempMission', () => ({
  useInsertTempMission: () => [],
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
    // Step progress shows "1. Mission" as the active step label
    expect(screen.getAllByText('1. Mission')[0]).toBeInTheDocument()
  })
})
