import { useQuery } from 'react-query'
import { token } from '../../axios'
import { AxiosInstance } from 'axios'
import useSessionToken from './useSessionToken'

export const useRefreshSessionToken = (config?: {
  instance?: AxiosInstance
  sessionTokenIdentifier?: string
}) => {
  const { sessionToken, setSessionToken } = useSessionToken(
    config?.sessionTokenIdentifier ?? 'TETHYS_ACCESS_TOKEN'
  )
  const query = useQuery(
    ['token'],
    () => {
      return token({
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        instance: config?.instance,
      })
    },
    {
      enabled: (sessionToken?.length ?? 0) > 0,
      staleTime: 60 * 60 * 1000,
      onSettled: data => {
        setSessionToken(data?.token ?? '')
      },
    }
  )
  return query
}
