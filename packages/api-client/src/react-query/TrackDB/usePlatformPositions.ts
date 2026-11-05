import { useQuery } from 'react-query'
import { getPlatformPositions, GetPlatformPositionsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

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
      // 1-minute staleTime matches Dash4's position refresh cadence and aligns
      // with PlatformPath's 1-minute useTick interval. The old 5-minute value
      // stacked with the 5-minute tick to leave positions up to ~10 min stale
      // (#857).
      staleTime: 60 * 1000,
      ...options,
    }
  )

  return query
}
