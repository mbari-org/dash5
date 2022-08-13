import { useQuery } from 'react-query'
import { getMissionSchedule, GetMissionScheduleParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useMissionSchedule = (
  params: GetMissionScheduleParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['mission', 'missions', 'schedule', params],
    () => {
      return getMissionSchedule(params, {
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
