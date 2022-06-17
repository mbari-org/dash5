import { useQuery } from 'react-query'
import {
  getMissionStartedEvent,
  GetMissionStartedEventParams,
} from '../../axios'
import { useAuthContext } from '../AuthProvider'
import { SupportedQueryOptions } from '../types'

export const useMissionStartedEvent = (
  params: GetMissionStartedEventParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useAuthContext()
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
