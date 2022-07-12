import { useQuery } from 'react-query'
import { getDeployments, GetDeploymentsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useDeployments = (
  params: GetDeploymentsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['deployment', 'deployments', params.vehicle, params.deploymentId],
    () => {
      return getDeployments(params, {
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
