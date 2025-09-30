import { useQuery } from 'react-query'
import { getLastDeployment, GetLastDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

// IMPORTANT NOTE: the last deployment endpoint sometimes returns a deployment with a start event that is in the future in preparation for the mission

export const useLastDeployment = (
  params: GetLastDeploymentParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['deployment', 'last', params.vehicle],
    () => {
      return getLastDeployment(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
