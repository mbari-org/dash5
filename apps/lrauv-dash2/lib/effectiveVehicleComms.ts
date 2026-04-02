/** Wall-clock window for treating last sbdReceive cell/sat as 'currently communicating'. */
export const COMMUNICATION_RECENCY_MS = 3 * 60 * 1000

export type EffectiveVehicleCommsInput = {
  pingReachable?: boolean | null
  lastSatCommsTime: number | null
  lastCellCommsTime: number | null
  nowMs: number
}

export const isEffectivelyCommunicating = (
  input: EffectiveVehicleCommsInput
): boolean => {
  const { pingReachable, lastSatCommsTime, lastCellCommsTime, nowMs } = input
  if (pingReachable) return true

  const withinWindow = (t: number | null): boolean => {
    if (t == null) return false
    const delta = nowMs - t
    return delta >= 0 && delta <= COMMUNICATION_RECENCY_MS
  }

  return withinWindow(lastCellCommsTime) || withinWindow(lastSatCommsTime)
}
