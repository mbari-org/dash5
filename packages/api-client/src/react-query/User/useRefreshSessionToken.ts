import { useQuery } from 'react-query'
import { token } from '../../axios'
import axios, { AxiosInstance } from 'axios'

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
      retry: false,
      onSuccess: (data) => {
        console.log(
          '[useRefreshSessionToken] onSuccess — data.token length:',
          data?.token?.length ?? 0,
          '| has profile:',
          !!(data?.firstName || data?.email)
        )
        if (data?.token) {
          // Server issued a new/rotated token — update the cookie.
          setSessionToken(data.token)
        }
        // If the server validated the token but didn't return a new one,
        // the existing cookie is still valid — do NOT clear it.
      },
      onError: (err: unknown) => {
        // Only clear the session token on explicit authentication failures
        // (401/403). For transient errors such as network timeouts or server
        // errors, preserve the existing token so a browser refresh does not
        // inadvertently log the user out.
        const status = axios.isAxiosError(err)
          ? err.response?.status
          : undefined
        console.log('[useRefreshSessionToken] onError — status:', status)
        if (status === 401 || status === 403) {
          console.warn('[useRefreshSessionToken] 401/403 — clearing token')
          setSessionToken('')
        }
      },
    }
  )
  return query
}
