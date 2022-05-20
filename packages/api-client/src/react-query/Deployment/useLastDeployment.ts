import { useQuery } from 'react-query'
import { getLastDeployment, GetLastDeploymentParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useLastDeployment = (params: GetLastDeploymentParams) => {
  const { axiosInstance } = useAuthContext()
  const query = useQuery(
    ['deployment', 'last', params.vehicle],
    () => {
      return getLastDeployment(params, {
        instance: axiosInstance,
      })
    },
    {
      staleTime: 60 * 1000,
    }
  )
  return query
}
