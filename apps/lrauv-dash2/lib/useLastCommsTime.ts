import {
  getEvents,
  GetEventsParams,
  useTethysApiContext,
} from '@mbari/api-client'
import { getAdjustedUnixTime } from '@mbari/utils'
import { useQuery } from 'react-query'

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
  const { axiosInstance } = useTethysApiContext()
  const adjustedStartTime = getAdjustedUnixTime({
    unixTime: startTimeMillis,
    offsetDays: -1,
  })

  // Use a single-page fetch (no recursive backfill) so that polling at 30s
  // does not generate unbounded paginated requests for long deployments.
  // Fetching in descending order (most recent first) with a generous limit
  // ensures we capture at least one sat (state===0) and cell (state===2)
  // event even when one type dominates — without paging.
  const params: GetEventsParams = {
    vehicles: [vehicleName],
    eventTypes: ['sbdReceive'],
    from: adjustedStartTime,
    limit: 100,
    ascending: 'n',
  }

  const { data: eventsData } = useQuery(
    ['event', 'lastCommsTime', vehicleName, adjustedStartTime],
    () => getEvents(params, { instance: axiosInstance }),
    {
      staleTime: 60 * 1000,
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // startTimeMillis defaults to 0 when the deployment hasn't loaded yet.
      // Subtracting 1 day produces from=-86400000, which TethysDash rejects
      // with a 400. Disable the query until a real start time is available.
      enabled: startTimeMillis > 0,
    }
  )

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
