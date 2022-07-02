import { AxiosInstance } from 'axios'
import { useQuery } from 'react-query'
import { getInfo, GetInfoParams } from '../../axios'
import { SupportedQueryOptions } from '../types'

export const useSiteConfig = (
  params: GetInfoParams,
  options?: SupportedQueryOptions,
  instance?: AxiosInstance
) => {
  const query = useQuery(
    ['info', 'config', params],
    () => {
      return getInfo(params, {
        instance: instance,
      })
    },
    {
      staleTime: 60 * 1000 * 60, // 1 hour
      ...options,
    }
  )
  return query
}
