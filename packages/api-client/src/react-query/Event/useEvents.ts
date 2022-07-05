import { useQuery } from 'react-query'
import { getEvents, GetEventsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useEvents = (
  params: GetEventsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['event', 'events', params],
    () => {
      return getEvents(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
  return query
}
