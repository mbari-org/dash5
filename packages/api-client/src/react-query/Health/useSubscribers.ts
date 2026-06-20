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
      // With 30s polling, React Query's default retry on failure would pile on
      // top of the refetch cadence. Set retry: false so poll interval is the
      // only retry mechanism (avoids traffic spikes on expected 403s).
      retry: false,
      ...options,
      // Placed after spread so callers cannot accidentally disable the auth
      // gate by passing options.enabled. Both conditions must hold.
      enabled: (options?.enabled ?? true) && !!authenticated,
    }
  )
}
