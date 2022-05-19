import React, { useEffect, useRef } from 'react'
import { useCreateLogin } from '../User/useCreateLogin'
import { useRefreshSessionToken } from '../User/useRefreshSessionToken'
import { AuthContext, AuthContextProfile } from './AuthContext'
import { getInstance } from '../../axios/getInstance'

interface AuthProviderProps {
  baseURL?: string
  onSessionStart?: (profile: AuthContextProfile) => void
  onSessionEnd?: () => void
  setSessionToken: (token: string) => void
  sessionToken: string
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  baseURL,
  children,
  setSessionToken,
  sessionToken,
  onSessionEnd,
  onSessionStart,
}) => {
  // We have to track a lot of state related to the auth token.
  // If an initial token is supplied we'll want to refresh it
  // on mount. If not, we'll want to create a new one. But we
  // don't want to do this on mount if the user is logged out.
  // So we'll use a ref to track the token and only refresh it
  // if it doesn't match the currentUser's token or if the user
  // has logged out -- something we are explicitly tracking as
  // additional state here via `loggedOut`.
  const lastInitialToken = useRef(null as string | null)
  const [loggedOut, setLoggedOut] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<
    AuthContextProfile | undefined
  >()
  const existingToken = currentUser?.token

  // Store any errors resulting from login / token refresh attempts.
  // This error will be exposed by the AuthProvider.
  const [error, setError] = React.useState<string | undefined>()

  // Store a reference to an axios instance with a default config.
  // This is stored in a ref and is only expected to be set once.
  const instance = useRef(getInstance({ baseURL }))
  const loginUser = useCreateLogin({
    instance: instance.current,
    sessionToken,
    setSessionToken,
  })

  // We'll refresh any existing token via ReactQuery. The query will
  // only execute if an authToken is present. Additionally, the stale
  // time on this query is set to 1 hour so it won't repeatedly run
  // during the same session. You should only see this called immediately
  // after a successful login or when the application mounts if an
  // initial token is supplied.
  const refreshedSession = useRefreshSessionToken({
    instance: instance.current,
    sessionToken,
    setSessionToken,
  })

  // We'll update the current user state from the refreshed session
  // response. The TethysDash API will return a user object that
  // is identical to the login response.
  useEffect(() => {
    if (
      !loggedOut &&
      refreshedSession.data?.token &&
      refreshedSession.data?.token !== existingToken
    ) {
      setCurrentUser(refreshedSession.data)
    }
  }, [refreshedSession.data?.token, lastInitialToken.current, existingToken])

  // This handler is available in the AuthContext for use in components
  const login = React.useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginUser.mutateAsync({ email, password })
        setCurrentUser(response)
        setError(undefined)
        setLoggedOut(false)
        onSessionStart?.(response)
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [setCurrentUser, setError, loginUser]
  )

  // This handler is available in the AuthContext for use in components
  const logout = React.useCallback(() => {
    setCurrentUser(undefined)
    setError(undefined)
    setLoggedOut(true)
    onSessionEnd?.()
  }, [setCurrentUser, setError])

  return (
    <AuthContext.Provider
      value={{
        login,
        token: currentUser?.token,
        logout,
        error,
        authenticated: currentUser?.token?.length ?? 0 ? true : false,
        profile: currentUser,
        loading: loginUser.isLoading,
        axiosInstance: instance.current,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
