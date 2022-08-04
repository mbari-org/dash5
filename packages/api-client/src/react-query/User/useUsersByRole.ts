import { usersByRole, ByRoleParams } from '../../axios'
import { useQuery } from 'react-query'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useUsersByRole = (
  params: ByRoleParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['users', 'role', params],
    () => {
      return usersByRole(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
  return query
}
