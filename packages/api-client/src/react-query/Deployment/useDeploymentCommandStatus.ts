import { useQuery } from 'react-query'
import { getCommandStatus, GetCommandStatusParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useDeploymentCommandStatus = (
  params: GetCommandStatusParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['deployment', 'deployments', 'commandStatus', params.deploymentId],
    () => {
      return getCommandStatus(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
