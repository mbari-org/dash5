import { useQuery } from 'react-query'
import { token } from '../../axios'
import { AxiosInstance } from 'axios'

export const useRefreshSessionToken = (config: {
  instance?: AxiosInstance
  setSessionToken: (token: string) => void
  sessionToken: string
}) => {
  const { sessionToken, setSessionToken, instance } = config
  const query = useQuery(
    ['token'],
    () => {
      return token({
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        instance,
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
