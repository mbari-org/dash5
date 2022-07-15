import { useQuery } from 'react-query'
import { getLastDeployment, GetLastDeploymentParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

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
