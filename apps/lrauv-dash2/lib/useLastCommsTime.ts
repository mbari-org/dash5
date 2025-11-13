import { useEvents } from '@mbari/api-client'
import { getAdjustedUnixTime } from '@mbari/utils'

export type CommsType = 'sat' | 'cell' | null

export interface LastCommsTimeResult {
  lastSatCommsTime: number | null
  lastCellCommsTime: number | null
}

const isSatCommsEvent = (event: { eventType: string; state?: number }) => {
  // Satellite comms: sbdReceive with state === 0
  return event.eventType === 'sbdReceive' && event.state === 0
}

const isCellCommsEvent = (event: { eventType: string; state?: number }) => {
  // Cell comms: sbdReceive with state === 2
  return event.eventType === 'sbdReceive' && event.state === 2
}

export const useLastCommsTime = (
  vehicleName: string,
  startTimeMillis: number
): LastCommsTimeResult => {
  const adjustedStartTime = getAdjustedUnixTime({
    unixTime: startTimeMillis,
    offsetDays: -1,
  })
  const { data: eventsData } = useEvents({
    vehicles: [vehicleName as string],
    eventTypes: ['sbdReceive'],
    from: adjustedStartTime,
    limit: 500,
  })

  if (!eventsData) {
    return {
      lastSatCommsTime: null,
      lastCellCommsTime: null,
    }
  }

  // Separate sat and cell comms based on sbdReceive state
  const satCommsEvents = eventsData.filter(isSatCommsEvent)
  const cellCommsEvents = eventsData.filter(isCellCommsEvent)

  // Get most recent times
  const lastSatCommsTime =
    satCommsEvents
      .sort((a, b) => b.unixTime - a.unixTime)
      .map((e) => e.unixTime)?.[0] ?? null

  const lastCellCommsTime =
    cellCommsEvents
      .sort((a, b) => b.unixTime - a.unixTime)
      .map((e) => e.unixTime)?.[0] ?? null

  return {
    lastSatCommsTime,
    lastCellCommsTime,
  }
}
