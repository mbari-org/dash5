import { AxiosInstance } from 'axios'
import { useQuery } from 'react-query'
import { getInfo, GetInfoParams } from '../../axios'
import { SupportedQueryOptions } from '../types'

export const useSiteConfig = (
  params?: GetInfoParams,
  options?: SupportedQueryOptions,
  instance?: AxiosInstance
) => {
  const resolvedParams = params ?? {}
  const query = useQuery(
    ['info', 'config', resolvedParams],
    () => {
      return getInfo(resolvedParams, {
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
