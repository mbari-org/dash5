import { useQuery } from 'react-query'
import { token } from '../../axios'
import { AxiosInstance } from 'axios'

export const useRefreshSessionToken = (config?: {
  instance?: AxiosInstance
  authToken?: string
}) => {
  const query = useQuery(
    ['token'],
    () => {
      return token({
        headers: {
          Authorization: `Bearer ${config?.authToken}`,
        },
        instance: config?.instance,
      })
    },
    {
      enabled: (config?.authToken?.length ?? 0) > 0,
      staleTime: 60 * 60 * 1000,
    }
  )
  return query
}
