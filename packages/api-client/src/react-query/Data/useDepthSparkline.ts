import { useQuery } from 'react-query'
import { useRef } from 'react'
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
  // Stable reference so the React Query key doesn't change on every re-render
  // (which would create a new cache entry each time data arrives and prevent
  // the sparkline from ever displaying).
  const fromRef = useRef(Date.now() - EIGHT_HOURS_MS)
  const from = fromRef.current

  const depthQuery = useQuery(
    ['depthSparkline', 'depth', vehicle, from],
    () => getDepthData({ vehicle, from }, { instance: axiosInstance }),
    {
      staleTime: 2 * 60 * 1000,
      ...options,
      enabled: !!vehicle && options?.enabled !== false,
    }
  )

  const commsQuery = useQuery(
    ['depthSparkline', 'comms', vehicle, from],
    () =>
      getEvents(
        {
          vehicles: [vehicle],
          eventTypes: ['sbdReceive', 'gpsFix', 'argoReceive'] as EventType[],
          from,
          limit: 10000, // high limit — comms events over 8h rarely exceed this
        },
        { instance: axiosInstance }
      ),
    {
      staleTime: 2 * 60 * 1000,
      ...options,
      enabled: !!vehicle && options?.enabled !== false,
    }
  )

  const rawDepthTimes = depthQuery.data?.times ?? []
  const rawDepthValues = depthQuery.data?.values ?? []

  // Convert ms to minutes for the sparkline (matching auvstatus.py convention)
  const depthTimesMin = rawDepthTimes.map((t) => t / 1000 / 60)
  const nowMin = Date.now() / 1000 / 60

  // Detect stale data gap >4 minutes and append a fake pad point (matching auvstatus.py)
  let depthTimes = depthTimesMin
  let depthValues = rawDepthValues
  let padded = false
  if (depthTimesMin.length > 0 && nowMin - Math.max(...depthTimesMin) > 4) {
    const lastT = Math.max(...depthTimesMin)
    depthTimes = [...depthTimesMin, lastT, lastT + 2, nowMin]
    depthValues = [...rawDepthValues, 1, 10, 10]
    padded = true
  }

  // Separate comms events by type and state (matching auvstatus.py extractCommHistory)
  const celTimes: number[] = []
  const satTimes: number[] = []
  const gpsTimes: number[] = []
  const argoTimes: number[] = []

  for (const event of commsQuery.data ?? []) {
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
