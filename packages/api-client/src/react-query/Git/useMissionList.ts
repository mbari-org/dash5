import { useQuery } from 'react-query'
import { getMissionList, MissionListParams } from '../../axios'
import { SupportedQueryOptions } from '../types'
import { useTethysApiContext } from '../TethysApiProvider'

export const useMissionList = (
  params: MissionListParams = {},
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const { gitRef, reload } = params
  const query = useQuery(
    // Keep reload out of the key so all consumers share one cache entry.
    ['git', 'missionList', gitRef ?? null],
    () => {
      return getMissionList(
        { gitRef, reload },
        {
          instance: axiosInstance,
          headers: { Authorization: `Bearer ${token}` },
        }
      )
    },
    {
      staleTime: 60 * 1000 * 5, // 5 minutes
      // Callers that request reload must hit the network even if cache is fresh.
      refetchOnMount: reload === 'y' ? 'always' : undefined,
      ...options,
    }
  )
  return query
}
