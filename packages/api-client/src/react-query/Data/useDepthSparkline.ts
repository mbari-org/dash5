import { useQuery } from 'react-query'
import { getDepthData } from '../../axios/Data/getDepthData'
import { getEvents, EventType } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000

export interface DepthSparklineData {
  depthTimes: number[] // minutes since epoch
  depthValues: number[] // meters
  celTimes: number[] // ms epoch — cell comms (sbdReceive state === 2)
  satTimes: number[] // ms epoch — sat comms (sbdReceive state === 0)
  gpsTimes: number[] // ms epoch — GPS fixes
  argoTimes: number[] // ms epoch — Argo receives
  padded: boolean // true when last depth point is >4 min old (extrapolated)
}

export const useDepthSparkline = (
  { vehicle }: { vehicle: string },
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()

  // Keep a stable query key per vehicle so React Query re-uses the cache entry
  // across re-renders. The rolling 8-hour window is computed fresh inside each
  // queryFn so the chart stays current as long as refetchInterval triggers.
  // Default interval is 2 minutes; callers can override via options.
  const REFETCH_INTERVAL = 2 * 60 * 1000

  const depthQuery = useQuery(
    ['depthSparkline', 'depth', vehicle],
    () =>
      getDepthData(
        { vehicle, from: Date.now() - EIGHT_HOURS_MS },
        { instance: axiosInstance }
      ),
    {
      staleTime: REFETCH_INTERVAL,
      refetchInterval: REFETCH_INTERVAL,
      ...options,
      enabled: !!vehicle && options?.enabled !== false,
    }
  )

  const commsQuery = useQuery(
    ['depthSparkline', 'comms', vehicle],
    () =>
      getEvents(
        {
          vehicles: [vehicle],
          eventTypes: ['sbdReceive', 'gpsFix', 'argoReceive'] as EventType[],
          from: Date.now() - EIGHT_HOURS_MS,
          limit: 10000, // high limit — comms events over 8h rarely exceed this
        },
        { instance: axiosInstance }
      ),
    {
      staleTime: REFETCH_INTERVAL,
      refetchInterval: REFETCH_INTERVAL,
      ...options,
      enabled: !!vehicle && options?.enabled !== false,
    }
  )

  const nowMs = Date.now()
  const windowStart = nowMs - EIGHT_HOURS_MS
  // Floor to whole minutes — DepthSparkline buckets "now" to the nearest minute,
  // so using a fractional value here would place padded tail points past boxRight.
  const nowMin = Math.floor(nowMs / 1000 / 60)
  const windowStartMin = Math.floor(windowStart / 1000 / 60)

  // Clamp depth data to the rolling 8-hour window and keep times/values aligned.
  // The API is asked for the same window on each refetch, but cached data can lag
  // by up to staleTime (2 min) so we trim defensively here as well.
  const rawTimes = depthQuery.data?.times ?? []
  const rawValues = depthQuery.data?.values ?? []
  const safeLen = Math.min(rawTimes.length, rawValues.length)
  const depthTimesMin: number[] = []
  const clampedValues: number[] = []
  for (let i = 0; i < safeLen; i++) {
    const tMin = rawTimes[i] / 1000 / 60
    if (tMin >= windowStartMin) {
      depthTimesMin.push(tMin)
      clampedValues.push(rawValues[i])
    }
  }

  // Detect stale data gap >4 minutes and append three pad points (lastT, lastT+2, nowMin)
  // to extrapolate the vehicle's continued dive — matching auvstatus.py padding logic.
  // DepthSparkline expects exactly 3 trailing pad points when isPadded is true.
  let depthTimes = depthTimesMin
  let depthValues = clampedValues
  let padded = false
  if (depthTimesMin.length > 0 && nowMin - Math.max(...depthTimesMin) > 4) {
    const lastT = Math.max(...depthTimesMin)
    depthTimes = [...depthTimesMin, lastT, lastT + 2, nowMin]
    depthValues = [...clampedValues, 1, 10, 10]
    padded = true
  }

  // Separate comms events by type and state (matching auvstatus.py extractCommHistory).
  // Clamp to the rolling 8-hour window so stale cached entries don't plot outside range.
  const celTimes: number[] = []
  const satTimes: number[] = []
  const gpsTimes: number[] = []
  const argoTimes: number[] = []

  for (const event of commsQuery.data ?? []) {
    if (event.unixTime < windowStart) continue
    if (event.eventType === 'sbdReceive') {
      if (event.state === 2) {
        celTimes.push(event.unixTime)
      } else if (event.state === 0) {
        satTimes.push(event.unixTime)
      }
    } else if (event.eventType === 'gpsFix') {
      gpsTimes.push(event.unixTime)
    } else if (event.eventType === 'argoReceive') {
      argoTimes.push(event.unixTime)
    }
  }

  const data: DepthSparklineData = {
    depthTimes,
    depthValues,
    celTimes,
    satTimes,
    gpsTimes,
    argoTimes,
    padded,
  }

  return {
    data,
    isLoading: depthQuery.isLoading || commsQuery.isLoading,
    isError: depthQuery.isError || commsQuery.isError,
  }
}
