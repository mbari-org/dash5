import { useMemo, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { getDepthData } from '../../axios/Data/getDepthData'
import { getEvents, EventType } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000
// Fallback window when the 8-hour query returns no depth data (vehicle submerged
// longer than 8 h). 7 days covers any realistic long-dive / no-comms scenario.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
// Cap the fallback at 480 points (~1/min × 8 h) to avoid an oversized payload.
const LONG_DIVE_MAXLEN = 480
// Default refetch interval — 2 minutes keeps the rolling window current.
const REFETCH_INTERVAL = 2 * 60 * 1000
// Depth threshold (meters) below which a point is considered a surface event.
// Used to trim fallback data to the current dive cycle for correct scale.
const SURFACE_DEPTH_M = 2

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
  const queryClient = useQueryClient()

  // Keep a stable query key per vehicle so React Query re-uses the cache entry
  // across re-renders. The rolling 8-hour window is computed fresh inside each
  // queryFn so the chart stays current as long as refetchInterval triggers.
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

  // Fallback: prefetched in parallel with the primary query. Fetches the most
  // recent LONG_DIVE_MAXLEN points from a 7-day window so that if the 8-hour
  // window returns no data (vehicle submerged > 8 h), the sparkline can show
  // the last known dive profile immediately — no extra round-trip after the
  // empty primary. The initial 7-day request runs whenever the hook is enabled;
  // refetchInterval / focus / reconnect stay gated on primarySucceededEmpty so
  // the common case (primary has data) does not keep polling the 7-day endpoint.
  const primarySucceededEmpty =
    depthQuery.isSuccess && (depthQuery.data?.times.length ?? 0) === 0
  const longDiveQuery = useQuery(
    ['depthSparkline', 'depth', vehicle, 'longDive'],
    () =>
      getDepthData(
        { vehicle, from: Date.now() - SEVEN_DAYS_MS, maxlen: LONG_DIVE_MAXLEN },
        { instance: axiosInstance }
      ),
    {
      staleTime: REFETCH_INTERVAL,
      refetchInterval: primarySucceededEmpty ? REFETCH_INTERVAL : false,
      // Only refetch on focus/reconnect in long-dive mode — avoids spurious 7-day polls in the common case.
      refetchOnWindowFocus: primarySucceededEmpty,
      refetchOnReconnect: primarySucceededEmpty,
      ...options,
      enabled: !!vehicle && options?.enabled !== false,
    }
  )

  // When fallback mode activates (including mid-session after primary goes
  // empty), force-refresh the long-dive cache. Prefetch data can be stale
  // because long-dive polling stays off while the primary window has points.
  // Arm `longDiveRefreshPending` during render (before paint) so we never emit
  // the mount-time cache for a frame; the effect then runs the refresh.
  const fallbackGateKey = primarySucceededEmpty
    ? `${vehicle}:empty`
    : `${vehicle}:active`
  // null until first arm so a warm RQ cache that is already empty on mount
  // still forces a refresh instead of painting stale prefetch immediately.
  const [armedFallbackGateKey, setArmedFallbackGateKey] = useState<
    string | null
  >(null)
  const [longDiveRefreshPending, setLongDiveRefreshPending] = useState(false)

  if (armedFallbackGateKey !== fallbackGateKey) {
    setArmedFallbackGateKey(fallbackGateKey)
    setLongDiveRefreshPending(primarySucceededEmpty)
  }

  useEffect(() => {
    if (!longDiveRefreshPending || !primarySucceededEmpty) return

    let active = true
    void queryClient
      .refetchQueries({
        queryKey: ['depthSparkline', 'depth', vehicle, 'longDive'],
      })
      .finally(() => {
        if (active) setLongDiveRefreshPending(false)
      })
    return () => {
      active = false
    }
  }, [longDiveRefreshPending, primarySucceededEmpty, vehicle, queryClient])

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

  // Drive nowMinBucket from a 60s interval so the padded tail's final point
  // stays aligned with DepthSparkline's own nowBucket and doesn't drift for
  // up to 2 minutes waiting for the next React Query refetch.
  // Gate on the same enabled condition as the queries so we don't fire a
  // state update every minute when the hook is intentionally disabled.
  const isEnabled = !!vehicle && options?.enabled !== false
  const [nowMinBucket, setNowMinBucket] = useState(() =>
    Math.floor(Date.now() / 60000)
  )
  useEffect(() => {
    if (!isEnabled) return
    const id = setInterval(
      () => setNowMinBucket(Math.floor(Date.now() / 60000)),
      60000
    )
    return () => clearInterval(id)
  }, [isEnabled])

  // Memoize all data-shaping so the potentially large loops (up to 10 000 comms
  // events) only run when the underlying query data or the minute bucket changes,
  // not on every unrelated re-render of the consuming component.
  const data = useMemo((): DepthSparklineData => {
    const nowMin = nowMinBucket
    const windowStart = (nowMin - 8 * 60) * 60000 // ms epoch for windowStart
    const windowStartMin = nowMin - 8 * 60

    // Prefer the 8-hour window query; use the long-dive fallback only when the
    // primary query has *completed* with zero points (vehicle submerged > 8 h).
    // Gating on isSuccess prevents the fallback from activating during initial
    // load (when data is still undefined) and causing a premature wide-window plot.
    // Also wait out longDiveRefreshPending so we do not plot a stale prefetch
    // while the forced mid-session refresh is still in flight.
    const usingFallback =
      depthQuery.isSuccess &&
      (depthQuery.data?.times ?? []).length === 0 &&
      !longDiveRefreshPending
    const rawTimes = usingFallback
      ? longDiveQuery.data?.times ?? []
      : depthQuery.data?.times ?? []
    const rawValues = usingFallback
      ? longDiveQuery.data?.values ?? []
      : depthQuery.data?.values ?? []

    // Clamp depth data to the rolling 8-hour window. For the long-dive fallback,
    // skip the time clamp — all returned points are older than 8 h by definition,
    // and we need them to reconstruct the dive profile before padding forward.
    const safeLen = Math.min(rawTimes.length, rawValues.length)
    let depthTimesMin: number[] = []
    let clampedValues: number[] = []
    for (let i = 0; i < safeLen; i++) {
      const tMin = Math.floor(rawTimes[i] / 60000)
      if (usingFallback || tMin >= windowStartMin) {
        depthTimesMin.push(tMin)
        clampedValues.push(rawValues[i])
      }
    }

    // In fallback mode the payload can span multiple dive cycles. Trim to the
    // current dive by finding the last surface event (depth < 2 m) and keeping
    // only points from there onward. This ensures the depth scale reflects the
    // current dive rather than a historical maximum from a previous mission.
    if (usingFallback && clampedValues.length > 0) {
      let lastSurfaceIdx = -1
      for (let i = clampedValues.length - 1; i >= 0; i--) {
        if (clampedValues[i] < SURFACE_DEPTH_M) {
          lastSurfaceIdx = i
          break
        }
      }
      if (lastSurfaceIdx >= 0) {
        depthTimesMin = depthTimesMin.slice(lastSurfaceIdx)
        clampedValues = clampedValues.slice(lastSurfaceIdx)
      }
    }

    // Detect stale data gap >4 minutes and append three pad points (lastT, lastT+2, nowMin)
    // to extrapolate the vehicle's continued dive — matching auvstatus.py padding logic.
    // DepthSparkline expects exactly 3 trailing pad points when isPadded is true.
    let depthTimes = depthTimesMin
    let depthValues = clampedValues
    let padded = false
    if (depthTimesMin.length > 0) {
      const lastT = Math.max(...depthTimesMin)
      if (nowMin - lastT > 4) {
        depthTimes = [...depthTimesMin, lastT, lastT + 2, nowMin]
        depthValues = [...clampedValues, 1, 10, 10]
        padded = true
      }
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

    return {
      depthTimes,
      depthValues,
      celTimes,
      satTimes,
      gpsTimes,
      argoTimes,
      padded,
    }
  }, [
    depthQuery.data,
    depthQuery.isSuccess,
    longDiveQuery.data,
    longDiveRefreshPending,
    commsQuery.data,
    nowMinBucket,
  ])

  return {
    data,
    isLoading:
      depthQuery.isLoading ||
      commsQuery.isLoading ||
      longDiveRefreshPending ||
      (primarySucceededEmpty && longDiveQuery.isLoading),
    isError:
      depthQuery.isError ||
      commsQuery.isError ||
      (primarySucceededEmpty && longDiveQuery.isError),
  }
}
