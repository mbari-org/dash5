import { useInfiniteQuery } from 'react-query'
import { getEvents, GetEventsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

const DEFAULT_LIMIT = 500

export const useInfiniteEvents = (
  params: GetEventsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const limit = params.limit ?? DEFAULT_LIMIT

  return useInfiniteQuery(
    ['events', params],
    async ({ pageParam }) => {
      const query: GetEventsParams = {
        ...params,
        from: params.from,
        limit,
        to: pageParam ?? params.to,
      }

      return getEvents(query, { instance: axiosInstance })
    },
    {
      enabled: options?.enabled ?? true,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      refetchOnReconnect: options?.refetchOnReconnect,
      refetchInterval: options?.refetchInterval,
      getNextPageParam: (lastPage) => {
        // empty or short page  →  no more data
        if (!lastPage || lastPage.length < limit) return undefined

        const oldest = lastPage[lastPage.length - 1].unixTime
        // reached lower bound  →  stop
        if (oldest <= params.from) return undefined

        // fetch the next slice older than the current oldest
        return oldest - 1
      },
    }
  )
}
