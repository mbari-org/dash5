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
  // Keep reload out of the query key so all callers share one cache;
  // refetchOnMount when reload=y so that shared entry is not left stale.
  const query = useQuery(
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
      refetchOnMount: reload === 'y' ? 'always' : undefined,
      ...options,
    }
  )
  return query
}
