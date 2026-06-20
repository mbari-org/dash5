import { useQuery } from 'react-query'
import { getSubscribers } from '../../axios/Health/getSubscribers'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useSubscribers = (options?: SupportedQueryOptions) => {
  const { axiosInstance, authenticated } = useTethysApiContext()
  return useQuery(
    ['health', 'subscribers'],
    () => getSubscribers({ instance: axiosInstance ?? undefined }),
    {
      refetchInterval: 30 * 1000,
      staleTime: 25 * 1000,
      ...options,
      // Placed after spread so callers cannot accidentally disable the auth
      // gate by passing options.enabled. Both conditions must hold.
      enabled: (options?.enabled ?? true) && !!authenticated,
    }
  )
}
