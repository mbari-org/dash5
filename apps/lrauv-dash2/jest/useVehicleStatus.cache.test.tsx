import '@testing-library/jest-dom'
import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import {
  TethysApiContext,
  type TethysApiContextProviderProps,
} from '@mbari/api-client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useVehicleStatus } from '../lib/useVehicleStatus'
import { getTethysSubscriptionQueryKey } from '../lib/useWebSocketListeners'

const NOW = 1_700_000_000_000

const VehicleStatusCacheProbe: React.FC = () => {
  const s = useVehicleStatus({
    vehicleName: 'makai',
    lastSatCommsTime: null,
    lastCellCommsTime: null,
    nowMs: NOW,
  })
  return (
    <>
      <span data-testid="reachable">
        {String(s.pingEvent?.reachable ?? '')}
      </span>
      <span data-testid="physical">{s.physicalStatus}</span>
    </>
  )
}

const stubTethysApi = (
  profile: TethysApiContextProviderProps['profile']
): TethysApiContextProviderProps => ({
  login: jest.fn(),
  logout: jest.fn(),
  authenticated: false,
  loading: false,
  profile,
})

const renderWithApiContext = (
  queryClient: QueryClient,
  apiValue: TethysApiContextProviderProps
) =>
  render(
    <TethysApiContext.Provider value={apiValue}>
      <QueryClientProvider client={queryClient}>
        <VehicleStatusCacheProbe />
      </QueryClientProvider>
    </TethysApiContext.Provider>
  )

describe('useVehicleStatus subscription cache', () => {
  it('re-renders when React Query cache is updated (no account email in key)', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    renderWithApiContext(queryClient, stubTethysApi(undefined))

    expect(screen.getByTestId('physical')).toHaveTextContent('underwater')
    expect(screen.getByTestId('reachable')).toHaveTextContent('')

    const queryKey = getTethysSubscriptionQueryKey(
      'VehiclePingResult',
      'makai',
      undefined
    )

    act(() => {
      queryClient.setQueryData(queryKey, {
        eventName: 'VehiclePingResult',
        vehicleName: 'makai',
        reachable: true,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('reachable')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('physical')).toHaveTextContent('surfaced')
  })

  it('re-renders when cache uses the logged-in three-part query key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const accountEmail = 'jim@sumocreations.com'

    renderWithApiContext(queryClient, stubTethysApi({ email: accountEmail }))

    expect(screen.getByTestId('physical')).toHaveTextContent('underwater')

    const queryKey = getTethysSubscriptionQueryKey(
      'VehiclePingResult',
      'makai',
      accountEmail
    )

    act(() => {
      queryClient.setQueryData(queryKey, {
        eventName: 'VehiclePingResult',
        vehicleName: 'makai',
        reachable: true,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('reachable')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('physical')).toHaveTextContent('surfaced')
  })
})
