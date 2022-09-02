import { useQuery } from 'react-query'
import { getMissionList, MissionListParams } from '../../axios'
import { SupportedQueryOptions } from '../types'
import { useTethysApiContext } from '../TethysApiProvider'

export const useMissionList = (
  params: MissionListParams = {},
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['git', 'missionList', params],
    () => {
      return getMissionList(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      staleTime: 60 * 1000 * 5, // 1 hour
      ...options,
    }
  )
  return query
}
