import { renderHook } from '@testing-library/react'
import { useQuery } from 'react-query'
import {
  getEvents,
  useLastDeployment,
  useTethysApiContext,
} from '@mbari/api-client'
import { useBadBatteryFault } from '../lib/useBadBatteryFault'

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@mbari/api-client', () => ({
  getEvents: jest.fn(),
  useLastDeployment: jest.fn(),
  useTethysApiContext: jest.fn(),
}))

const mockUseQuery = useQuery as jest.Mock
const mockUseLastDeployment = useLastDeployment as jest.Mock
const mockUseTethysApiContext = useTethysApiContext as jest.Mock

const axiosInstance = {} as never

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTethysApiContext.mockReturnValue({ axiosInstance })
  mockUseQuery.mockReturnValue({ data: undefined, isLoading: false })
})

describe('useBadBatteryFault', () => {
  it('keeps the query disabled when deployment has not loaded yet', () => {
    mockUseLastDeployment.mockReturnValue({ data: undefined })

    renderHook(() => useBadBatteryFault('pontus'))

    const [, , options] = mockUseQuery.mock.calls[0]
    expect(options.enabled).toBe(false)
  })

  it('keeps the query disabled when deployment has no launch or start time', () => {
    mockUseLastDeployment.mockReturnValue({
      data: { launchEvent: null, startEvent: null },
    })

    renderHook(() => useBadBatteryFault('pontus'))

    const [, , options] = mockUseQuery.mock.calls[0]
    expect(options.enabled).toBe(false)
  })

  it('enables the query once launchEvent.unixTime is available', () => {
    mockUseLastDeployment.mockReturnValue({
      data: { launchEvent: { unixTime: 1_700_000_000_000 }, startEvent: null },
    })

    renderHook(() => useBadBatteryFault('pontus'))

    const [, , options] = mockUseQuery.mock.calls[0]
    expect(options.enabled).toBe(true)
  })

  it('enables the query using startEvent.unixTime when launchEvent is absent', () => {
    mockUseLastDeployment.mockReturnValue({
      data: { launchEvent: null, startEvent: { unixTime: 1_700_000_000_000 } },
    })

    renderHook(() => useBadBatteryFault('pontus'))

    const [, , options] = mockUseQuery.mock.calls[0]
    expect(options.enabled).toBe(true)
  })

  it('includes the launch time as the from param in the query key', () => {
    const unixTime = 1_700_000_000_000
    mockUseLastDeployment.mockReturnValue({
      data: { launchEvent: { unixTime }, startEvent: null },
    })

    renderHook(() => useBadBatteryFault('pontus'))

    const [queryKey] = mockUseQuery.mock.calls[0]
    expect(queryKey).toContain(unixTime)
  })
})
