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
  // Required with picker call sites that pass reload: 'y' (#792).
  // If reload were part of the query key, { reload: 'y' } and {} would be
  // separate cache entries — callers without reload could keep serving a
  // stale mission list for up to staleTime. Key on gitRef only, and when
  // reload is requested force a network refetch on mount so the shared
  // entry is refreshed (TethysDash caches missionList server-side unless
  // reload=y).
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
