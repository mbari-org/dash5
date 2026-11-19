import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { getCommandQueue, QueuedSbdSendEvent } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const COMMAND_QUEUE_QUERY_KEY = ['command', 'queue']

/**
 * Fetches the outgoing command queue for the given vehicles.
 * Returns a Map from refEventId → QueuedSbdSendEvent for fast lookup.
 * Invalidated by useWebSocketListeners when ResourceUpdated commandQueue fires.
 */
export const useCommandQueue = (
  vehicles: string[],
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const vehiclesParam = vehicles.join(',')

  const query = useQuery(
    [...COMMAND_QUEUE_QUERY_KEY, vehiclesParam],
    () =>
      getCommandQueue({ vehicles: vehiclesParam }, { instance: axiosInstance }),
    {
      staleTime: 30 * 1000,
      // Fallback poll when ResourceUpdated WebSocket is unavailable.
      refetchInterval: 5 * 60 * 1000,
      ...options,
      enabled: vehicles.length > 0 && (options?.enabled ?? true),
    }
  )

  const dispatchedEventIds = useMemo(() => {
    const map = new Map<number, QueuedSbdSendEvent>()
    if (query.data) {
      for (const entries of Object.values(query.data)) {
        for (const entry of entries) {
          const existing = map.get(entry.refEventId)
          // Multipart commands produce one queue entry per SBD part, all sharing
          // the same refEventId. Preserve dispatched: true once any part is
          // dispatched so a later undispatched part does not hide the earlier one.
          map.set(entry.refEventId, {
            ...entry,
            dispatched: existing?.dispatched === true || entry.dispatched,
          })
        }
      }
    }
    return map
  }, [query.data])

  return { ...query, dispatchedEventIds }
}
