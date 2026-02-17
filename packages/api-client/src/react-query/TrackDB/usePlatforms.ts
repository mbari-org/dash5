import { useQuery } from 'react-query'
import { getPlatforms, GetPlatformsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const usePlatforms = (
  params?: GetPlatformsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, siteConfig } = useTethysApiContext()
  const odss2dashApi = siteConfig?.appConfig?.odss2dashApi as string
  const baseUrl = options?.baseUrl ?? odss2dashApi

  const query = useQuery(
    ['trackdb', 'platforms'],
    () => {
      return getPlatforms(params ?? {}, {
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
