import type { DeploymentEvent } from '@mbari/api-client'

/** Latest cell/sat comms must fall within this age (ms) to count as surfaced without ping. */
export const COMMUNICATION_RECENCY_MS = 3 * 60 * 1000

export type VehiclePhysicalStatus = 'pluggedIn' | 'surfaced' | 'underwater'

export type GetVehiclePhysicalStatusInput = {
  pingReachable?: boolean | null
  lastSatCommsTime: number | null
  lastCellCommsTime: number | null
  nowMs: number
  recoverEvent?: DeploymentEvent
  startEventUnix?: number | null
}

/**
 * Plugged-in (recovery or pre-launch) beats surfaced from ping or recent cell/sat times.
 * Use one `nowMs` from the caller for every time comparison.
 */
export const getVehiclePhysicalStatus = (
  input: GetVehiclePhysicalStatusInput
) => {
  const cellPingReachable = Boolean(input.pingReachable)

  const isPluggedIn = Boolean(
    input.recoverEvent ||
      (input.startEventUnix != null && input.startEventUnix > input.nowMs)
  )

  const withinWindow = (t: number | null) => {
    if (t == null) return false
    const delta = input.nowMs - t
    return delta >= 0 && delta <= COMMUNICATION_RECENCY_MS
  }

  const isLikelySurfaced =
    cellPingReachable ||
    withinWindow(input.lastCellCommsTime) ||
    withinWindow(input.lastSatCommsTime)

  const physicalStatus: VehiclePhysicalStatus = isPluggedIn
    ? 'pluggedIn'
    : isLikelySurfaced
    ? 'surfaced'
    : 'underwater'

  return {
    cellPingReachable,
    isPluggedIn,
    isLikelySurfaced,
    physicalStatus,
  }
}
