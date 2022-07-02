import { useQuery } from 'react-query'
import {
  getMissionStartedEvent,
  GetMissionStartedEventParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useMissionStartedEvent = (
  params: GetMissionStartedEventParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['event', 'missionStarted', params],
    () => {
      return getMissionStartedEvent(params, {
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
