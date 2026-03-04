import { useState, useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from 'react-query'
import { GetVPosResponse, GetVPosParams } from '@mbari/api-client'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'

const logger = createLogger('useRefreshPositions')

export interface VehiclePositionInfo {
  vehicleName: string
  gpsFixes: number
  argoReceives: number
  emergencies: number
  reachedWaypoints: number
}

export interface PreferredQueryParams {
  from: number
  to?: number
}

export interface UseRefreshPositionsOptions {
  autoRefreshMinutes?: number
  preferredParams?: Record<string, PreferredQueryParams>
}

/** Duration the refresh-position toast is shown and throttle window before another refresh is allowed. */
const REFRESH_TOAST_DURATION_MS = 3000
const getRefreshToastId = (vehicleName: string) =>
  `refresh-positions-${vehicleName}`

export interface UseRefreshPositionsReturn {
  loading: boolean
  lastRefreshed: Date | null
  refreshAll: () => Promise<Record<string, GetVPosResponse> | undefined>
  /** Call once when vehicle position data has first loaded (e.g. from VehiclePath) so "next refresh" countdown can start. */
  markInitialLoadDone: () => void
}

export const useRefreshPositions = (
  vehicleNames: string[],
  options: UseRefreshPositionsOptions = {}
): UseRefreshPositionsReturn => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const initializedRef = useRef(false)
  const lastRefreshRunRef = useRef<number>(0)

  const { autoRefreshMinutes, preferredParams } = options

  /** Call when vehicle position data has first loaded so "next refresh" countdown can start. Only set once. */
  const markInitialLoadDone = useCallback(() => {
    if (initializedRef.current) return
    setLastRefreshed(new Date())
    initializedRef.current = true
  }, [])

  // Fallback: if no VehiclePath reports data within 30s (e.g. no vehicles or slow load), set lastRefreshed so tooltip still shows
  useEffect(() => {
    if (vehicleNames.length === 0) return
    const timeout = setTimeout(() => {
      markInitialLoadDone()
    }, 30000)
    return () => clearTimeout(timeout)
  }, [vehicleNames.length, markInitialLoadDone])

  const showPositionNotification = useCallback(
    (vehicleNamesList: string[], results: Record<string, GetVPosResponse>) => {
      // One toast per vehicle; always show GPS fixes (including 0), others only if > 0
      vehicleNamesList.forEach((vehicleName) => {
        const data = results[vehicleName]
        const gpsFixes = data?.gpsFixes?.length ?? 0
        const argoReceives = data?.argoReceives?.length ?? 0
        const emergencies = data?.emergencies?.length ?? 0
        const reachedWaypoints = data?.reachedWaypoints?.length ?? 0

        const hasEmergencies = emergencies > 0
        const timeout = hasEmergencies ? 0 : REFRESH_TOAST_DURATION_MS

        const message = (
          <div>
            <strong>Loaded positions: {vehicleName}</strong>
            <div style={{ marginTop: '0.5em', marginLeft: '0.5em' }}>
              {emergencies > 0 && (
                <div style={{ color: 'red' }}>{emergencies} Emergency</div>
              )}
              <div>{gpsFixes} GPS fixes</div>
              {argoReceives > 0 && <div>{argoReceives} Argo</div>}
              {reachedWaypoints > 0 && <div>{reachedWaypoints} RWP</div>}
            </div>
          </div>
        )

        toast(message, {
          id: getRefreshToastId(vehicleName),
          position: 'bottom-left',
          duration: timeout || undefined,
          className: 'refresh-position-toast',
          style: {
            backgroundColor: '#424242',
            color: '#fff',
          },
        })
      })
    },
    []
  )

  const refreshAll = useCallback(async () => {
    if (vehicleNames.length === 0) {
      logger.warn('No vehicles to refresh')
      return
    }

    const now = Date.now()
    if (now - lastRefreshRunRef.current < REFRESH_TOAST_DURATION_MS) {
      return
    }
    lastRefreshRunRef.current = now

    setLoading(true)
    try {
      // Refetch the actual queries that VehiclePath components are using
      // This ensures we're refreshing with the same params that are displayed on the map
      await Promise.all(
        vehicleNames.map((vehicleName) =>
          queryClient.refetchQueries({
            queryKey: ['info', 'vehiclePos'],
            predicate: (query) => {
              const queryParams = query.queryKey[2] as GetVPosParams | undefined
              // Only refetch queries with valid parameters:
              // - vehicle must match
              // - from must be present and > 0
              return (
                queryParams?.vehicle === vehicleName &&
                queryParams?.from !== undefined &&
                queryParams.from > 0
              )
            },
          })
        )
      )

      // Get the updated data from React Query cache to show notifications.
      // Prefer the query that matches preferredParams (e.g. deployment page time range) so toast counts match the current view.
      const results: Record<string, GetVPosResponse> = {}
      const queries = queryClient.getQueriesData({
        queryKey: ['info', 'vehiclePos'],
        exact: false,
      })

      vehicleNames.forEach((vehicleName) => {
        const preferred = preferredParams?.[vehicleName]
        let match: GetVPosResponse | undefined
        let fallback: GetVPosResponse | undefined

        for (const [queryKey, data] of queries) {
          const queryParams = queryKey[2] as GetVPosParams | undefined
          if (queryParams?.vehicle !== vehicleName || !data) continue

          const response = data as GetVPosResponse

          if (preferred) {
            const fromMatch = queryParams.from === preferred.from
            const toMatch =
              preferred.to == null ? true : queryParams.to === preferred.to
            if (fromMatch && toMatch) {
              match = response
              break
            }
          } else {
            // No preferredParams (e.g. overview): prefer query with to (VehiclePath last-deployment window)
            if (queryParams.to !== undefined) {
              match = response
              break
            }
            if (!fallback) fallback = response
          }
        }
        const chosen = match ?? fallback
        if (chosen) results[vehicleName] = chosen
      })

      setLastRefreshed(new Date())
      initializedRef.current = true // Mark as initialized after first manual refresh
      showPositionNotification(vehicleNames, results)

      return results
    } catch (error) {
      logger.error('Error refreshing positions:', error)
      toast.error('Failed to refresh vehicle positions', {
        position: 'bottom-left',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [vehicleNames, preferredParams, showPositionNotification, queryClient])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshMinutes || !lastRefreshed) return

    const nextRefreshTime =
      lastRefreshed.getTime() + autoRefreshMinutes * 60 * 1000
    const timeUntil = nextRefreshTime - Date.now()

    if (timeUntil <= 0) return

    const timeout = setTimeout(() => {
      refreshAll().catch((error) => {
        logger.error('Auto-refresh failed:', error)
      })
    }, timeUntil)

    return () => clearTimeout(timeout)
  }, [lastRefreshed, autoRefreshMinutes, refreshAll])

  return {
    loading,
    lastRefreshed,
    refreshAll,
    markInitialLoadDone,
  }
}
