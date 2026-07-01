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

  // Deployment start minus one day, used as the stable query-key anchor.
  const COMMS_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000
  const deploymentFrom = getAdjustedUnixTime({
    unixTime: startTimeMillis,
    offsetDays: -1,
  })

  // Keep the query key stable (keyed by deploymentFrom, not Date.now()).
  // The rolling window is computed inside the fetch function so it is always
  // evaluated at fetch time — avoiding cache churn on every render.
  const { data: eventsData } = useQuery(
    ['event', 'lastCommsTime', vehicleName, deploymentFrom],
    () => {
      // Use a rolling 7-day lookback rather than the full deployment window.
      // Since we can't filter by event state (sat=0 / cell=2) server-side, we
      // rely on the time window being narrow enough that limit:100 reliably
      // covers both sat and cell events. If comms of either type haven't
      // occurred in 7 days the vehicle is overdue; the caller falls back to
      // vehicle.text_nextcomm (refreshed by useVehicleInfo polling).
      const recentFrom = Math.max(
        deploymentFrom,
        Date.now() - COMMS_LOOKBACK_MS
      )
      const params: GetEventsParams = {
        vehicles: [vehicleName],
        eventTypes: ['sbdReceive'],
        from: recentFrom,
        limit: 100,
        ascending: 'n',
      }
      return getEvents(params, { instance: axiosInstance })
    },
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
