import { useMemo } from 'react'
import type { DeploymentEvent } from '@mbari/api-client'
import { useTethysSubscriptionEvent } from './useWebSocketListeners'
import { isEffectivelyCommunicating } from './effectiveVehicleComms'
import { getPluggedInStatus } from './getPluggedInStatus'

export type VehiclePhysicalStatus = 'pluggedIn' | 'surfaced' | 'underwater'

export type UseVehicleStatusArgs = {
  vehicleName: string | undefined
  lastSatCommsTime: number | null
  lastCellCommsTime: number | null
  nowMs: number
  recoverEvent?: DeploymentEvent
  startEventUnix?: number | null
}

export const useVehicleStatus = ({
  vehicleName,
  lastSatCommsTime,
  lastCellCommsTime,
  nowMs,
  recoverEvent,
  startEventUnix,
}: UseVehicleStatusArgs) => {
  const pingEvent = useTethysSubscriptionEvent(
    'VehiclePingResult',
    vehicleName ?? ''
  )
  const cellPingReachable = Boolean(pingEvent?.reachable)

  const isPluggedIn = getPluggedInStatus({
    recoverEvent,
    startEventUnix,
  })

  const isLikelySurfaced = useMemo(
    () =>
      isEffectivelyCommunicating({
        pingReachable: cellPingReachable,
        lastSatCommsTime,
        lastCellCommsTime,
        nowMs,
      }),
    [cellPingReachable, lastSatCommsTime, lastCellCommsTime, nowMs]
  )

  const physicalStatus: VehiclePhysicalStatus = isPluggedIn
    ? 'pluggedIn'
    : isLikelySurfaced
    ? 'surfaced'
    : 'underwater'

  return {
    pingEvent,
    cellPingReachable,
    isPluggedIn,
    isLikelySurfaced,
    physicalStatus,
  }
}
