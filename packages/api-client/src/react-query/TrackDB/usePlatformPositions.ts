import { useQuery } from 'react-query'
import { getPlatformPositions, GetPlatformPositionsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

// 1-minute cadence matches Dash4. Exported so PlatformPath can share the same value for useTick (#857).
export const TRACKDB_POSITION_REFRESH_MS = 60_000

export const usePlatformPositions = (
  params: GetPlatformPositionsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, siteConfig } = useTethysApiContext()
  const odss2dashApi = siteConfig?.appConfig?.odss2dashApi
  const baseUrl = options?.baseUrl ?? odss2dashApi

  const query = useQuery(
    [
      'trackdb',
      'platforms',
      params.platformId,
      'positions',
      params.lastNumberOfFixes,
      params.startDate,
      params.endDate,
    ],
    () => {
      return getPlatformPositions(params, {
        instance: axiosInstance,
        baseURL: baseUrl,
      })
    },
    {
      staleTime: TRACKDB_POSITION_REFRESH_MS,
      ...options,
      // Keep previous position data visible while the new query key loads
      // (endDate changes every tick). Without this, the track briefly disappears
      // on each refresh cycle.
      keepPreviousData: true,
      // No retries — a 15-s timeout already matches Dash4 (#837); retrying would delay error display.
      retry: 0,
    }
  )

  return query
}
