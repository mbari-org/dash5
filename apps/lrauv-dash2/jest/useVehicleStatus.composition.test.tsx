import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { COMMUNICATION_RECENCY_MS } from '../lib/getVehiclePhysicalStatus'
import { useVehicleStatus } from '../lib/useVehicleStatus'
import { useTethysSubscriptionEvent } from '../lib/useWebSocketListeners'

jest.mock('../lib/useWebSocketListeners', () => {
  const actual = jest.requireActual('../lib/useWebSocketListeners') as Record<
    string,
    unknown
  >
  return {
    ...actual,
    useTethysSubscriptionEvent: jest.fn(),
  }
})

const mockedUseTethysSubscriptionEvent =
  useTethysSubscriptionEvent as jest.MockedFunction<
    typeof useTethysSubscriptionEvent
  >

const NOW = 1_700_000_000_000

const VehicleStatusProbe: React.FC<{
  lastCellCommsTime: number | null
  lastSatCommsTime?: number | null
}> = ({ lastCellCommsTime, lastSatCommsTime = null }) => {
  const status = useVehicleStatus({
    vehicleName: 'makai',
    lastSatCommsTime,
    lastCellCommsTime,
    nowMs: NOW,
  })
  return (
    <>
      <span data-testid="connected">{String(status.cellPingReachable)}</span>
      <span data-testid="physical">{status.physicalStatus}</span>
    </>
  )
}

describe('useVehicleStatus composition', () => {
  beforeEach(() => {
    mockedUseTethysSubscriptionEvent.mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows surfaced from cell comms inside the recency buffer when ping is unreachable', () => {
    mockedUseTethysSubscriptionEvent.mockReturnValue({
      eventName: 'VehiclePingResult',
      vehicleName: 'makai',
      reachable: false,
    })

    const lastCellWithinBuffer = NOW - COMMUNICATION_RECENCY_MS / 2

    render(
      <VehicleStatusProbe
        lastCellCommsTime={lastCellWithinBuffer}
        lastSatCommsTime={null}
      />
    )

    expect(screen.getByTestId('connected')).toHaveTextContent('false')
    expect(screen.getByTestId('physical')).toHaveTextContent('surfaced')
  })
})
