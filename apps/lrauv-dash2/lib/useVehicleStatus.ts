import type { DeploymentEvent } from '@mbari/api-client'
import { useTethysSubscriptionEvent } from './useWebSocketListeners'
import { getVehiclePhysicalStatus } from './getVehiclePhysicalStatus'

export type { VehiclePhysicalStatus } from './getVehiclePhysicalStatus'

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

  return {
    pingEvent,
    ...getVehiclePhysicalStatus({
      pingReachable: pingEvent?.reachable,
      lastSatCommsTime,
      lastCellCommsTime,
      nowMs,
      recoverEvent,
      startEventUnix,
    }),
  }
}
