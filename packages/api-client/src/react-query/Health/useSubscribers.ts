import { useQuery } from 'react-query'
import { getSubscribers } from '../../axios/Health/getSubscribers'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useSubscribers = (options?: SupportedQueryOptions) => {
  const { axiosInstance, token, profile } = useTethysApiContext()
  // Include the authenticated user's email in the key so the cache is scoped
  // per-user and doesn't leak a previous user's subscriber list on login
  // change or role change that results in a 403.
  return useQuery(
    ['health', 'subscribers', profile?.email ?? null],
    () =>
      getSubscribers({
        instance: axiosInstance ?? undefined,
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      // Stop polling after a 403 (role restriction) — the error is expected
      // and will not resolve without a permission change, so there is no
      // value in continuing to poll. All other errors keep the 30s cadence.
      refetchInterval: (_data, query) => {
        const status = (
          query.state.error as { response?: { status?: number } } | null
        )?.response?.status
        return status === 403 ? false : 30 * 1000
      },
      staleTime: 25 * 1000,
      // With 30s polling, React Query's default retry would pile on top of the
      // refetch cadence. Set retry: false so poll interval is the only retry.
      retry: false,
      ...options,
      // Placed after spread so callers cannot accidentally disable the auth
      // gate by passing options.enabled. Both conditions must hold.
      enabled: (options?.enabled ?? true) && (token?.length ?? 0) > 0,
    }
  )
}
