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
      staleTime: 5 * 60 * 1000,
      ...options,
      // Don't retry on timeout — getPlatformPositions uses a 15-s timeout to
      // match Dash4 (#837). Default React Query retries (3×) would mean up to
      // ~60 s before an error surfaces for a truly unreachable platform.
      retry: 0,
      // Keep the last successfully loaded track visible while a background
      // refetch is in progress, rather than hiding the platform during reload.
      // Directly addresses the reporter's ask: "avoid failure to display of
      // the previously successfully loaded track" (#837).
      keepPreviousData: true,
    }
  )

  return query
}
