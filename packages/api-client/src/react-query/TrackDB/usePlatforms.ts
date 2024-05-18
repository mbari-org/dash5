import { useQuery } from 'react-query'
import { getPlatforms, GetPlatformsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'
import axios, { AxiosInstance } from 'axios'

export const usePlatforms = (
  params: GetPlatformsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()

  const query = useQuery(
    ['trackdb', 'platforms'],
    () => {
      return getPlatforms(params, {
        instance: axiosInstance,
        baseURL: options?.baseUrl,
      })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )

  return query
}
