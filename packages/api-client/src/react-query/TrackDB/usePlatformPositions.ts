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
    }
  )

  return query
}
