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
      onSuccess: (data) => {
        if (data?.token) {
          setSessionToken(data.token)
        }
      },
      onError: (err: unknown) => {
        // Only clear the session token on explicit authentication failures
        // (401/403). For transient errors such as network timeouts or server
        // errors, preserve the existing token so a browser refresh does not
        // inadvertently log the user out.
        const status = (err as { response?: { status?: number } })?.response
          ?.status
        if (status === 401 || status === 403) {
          setSessionToken('')
        }
      },
    }
  )
  return query
}
