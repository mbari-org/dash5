import { useQuery } from 'react-query'
import { getLastDeployment, GetLastDeploymentParams } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useLastDeployment = (params: GetLastDeploymentParams) => {
  const { token, axiosInstance } = useAuthContext()
  const query = useQuery(
    ['deployment', 'last', params],
    () => {
      return getLastDeployment(params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        instance: axiosInstance,
      })
    },
    {
      enabled: (token?.length ?? 0) > 0,
      staleTime: 60 * 1000,
    }
  )
  return query
}
