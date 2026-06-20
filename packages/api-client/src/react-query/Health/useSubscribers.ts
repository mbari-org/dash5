import { useQuery } from 'react-query'
import { getSubscribers } from '../../axios/Health/getSubscribers'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useSubscribers = (options?: SupportedQueryOptions) => {
  const { axiosInstance, token, profile } = useTethysApiContext()
  // Include email + sorted roles in the key so the cache is scoped per-user
  // and React Query treats a role change (e.g. operator granted mid-session)
  // as a new cache entry, triggering an automatic refetch.
  const roleKey = (profile?.roles ?? []).slice().sort().join(',')
  return useQuery(
    ['health', 'subscribers', profile?.email ?? null, roleKey],
    () =>
      getSubscribers({
        instance: axiosInstance ?? undefined,
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      // Stop polling on 403 only when the user lacks the required role — in
      // that case the error won't resolve without a permission change. If the
      // user already has operator/admin, a 403 is more likely a transient auth
      // issue (e.g. token rotation) that will resolve on the next refetch.
      refetchInterval: (_data, query) => {
        const status = (
          query.state.error as { response?: { status?: number } } | null
        )?.response?.status
        if (status === 403) {
          const hasRole =
            profile?.roles?.some((r) => r === 'operator' || r === 'admin') ??
            false
          if (!hasRole) return false
        }
        return 30 * 1000
      },
      // Prevent window-focus and reconnect refetches from producing repeated
      // 403s after a role-restriction error is detected. Callers can override
      // either flag via options if needed.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
