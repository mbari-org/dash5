import { useQuery } from 'react-query'
import { getSubscribers } from '../../axios/Health/getSubscribers'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useSubscribers = (options?: SupportedQueryOptions) => {
  const { axiosInstance, authenticated, token } = useTethysApiContext()
  return useQuery(
    ['health', 'subscribers'],
    () => getSubscribers(token, axiosInstance),
    {
      enabled: authenticated,
      refetchInterval: 30 * 1000,
      staleTime: 25 * 1000,
      ...options,
    }
  )
}
