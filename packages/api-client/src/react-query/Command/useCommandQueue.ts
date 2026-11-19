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
      ...options,
      enabled: vehicles.length > 0 && (options?.enabled ?? true),
    }
  )

  const dispatchedEventIds = useMemo(() => {
    const map = new Map<number, QueuedSbdSendEvent>()
    if (query.data) {
      for (const entries of Object.values(query.data)) {
        for (const entry of entries) {
          map.set(entry.refEventId, entry)
        }
      }
    }
    return map
  }, [query.data])

  return { ...query, dispatchedEventIds }
}
