import React, { useEffect, useRef } from 'react'
import { useCreateLogin } from '../User/useCreateLogin'
import { useRefreshSessionToken } from '../User/useRefreshSessionToken'
import { TethysApiContext, TethysApiContextProfile } from './TethysApiContext'
import { getInstance } from '../../axios/getInstance'
import { useSiteConfig } from '../Info/useSiteConfig'
// Decode the JWT payload to extract profile fields (firstName, lastName, email,
// roles). The TethysDash /user/token endpoint validates the token but may omit
// these fields from its JSON response; the JWT itself always carries them.
const decodeJWTProfile = (
  token: string
): Partial<{
  firstName: string
  lastName: string
  email: string
  roles: string[]
}> => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      roles: payload.roles,
    }
  } catch {
    return {}
  }
}

interface TethysApiProviderProps {
  baseURL?: string
  onSessionStart?: (profile: TethysApiContextProfile) => void
  onSessionEnd?: () => void
  setSessionToken: (token: string) => void
  sessionToken: string
  children?: React.ReactNode
}

export const TethysApiProvider: React.FC<TethysApiProviderProps> = ({
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
    TethysApiContextProfile | undefined
  >()
  const existingToken = currentUser?.token

  // Store any errors resulting from login / token refresh attempts.
  // This error will be exposed by the TethysApiProvider.
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

  const { data: siteInfo } = useSiteConfig({}, {}, instance.current)

  // We'll update the current user state from the refreshed session
  // response. The TethysDash API may return a user object without a
  // token field (the token was already validated server-side). In that
  // case we preserve the existing session token from the cookie so the
  // user stays authenticated across browser refreshes.
  //
  // Additionally, the /user/token endpoint may return a minimal response
  // (e.g. no firstName/lastName). The JWT payload itself contains the full
  // profile, so we decode it as a fallback to avoid "uu" initials.
  useEffect(() => {
    if (!loggedOut && refreshedSession.data && !existingToken) {
      const token = refreshedSession.data.token || sessionToken
      if (token) {
        const apiProfile = refreshedSession.data
        const profile = apiProfile.firstName
          ? apiProfile
          : decodeJWTProfile(token)
        setCurrentUser({ ...profile, ...apiProfile, token })
      }
    }
  }, [
    refreshedSession.data,
    lastInitialToken,
    existingToken,
    sessionToken,
    loggedOut,
    setCurrentUser,
  ])

  // This handler is available in theTethysApiContext for use in components
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
    [setCurrentUser, setError, loginUser, onSessionStart]
  )

  // This handler is available in theTethysApiContext for use in components
  const logout = React.useCallback(() => {
    setCurrentUser(undefined)
    setError(undefined)
    setLoggedOut(true)
    onSessionEnd?.()
  }, [setCurrentUser, setError, setLoggedOut, onSessionEnd])

  // When the server rejects the session token (e.g. expired JWT → 401), clear
  // auth state so the login prompt is shown rather than a broken "authenticated"
  // UI with an expired token. Only fires when the user was actively logged in
  // (existingToken is truthy) to avoid interfering with the initial page load
  // path where the user was never authenticated.
  useEffect(() => {
    if (refreshedSession.isError && existingToken && !loggedOut) {
      logout()
    }
  }, [refreshedSession.isError, existingToken, loggedOut, logout])

  // Remain in loading state while a session token exists in the cookie but
  // currentUser hasn't been hydrated yet. This bridges the one-render gap
  // between refreshedSession.isLoading flipping to false and the useEffect
  // below calling setCurrentUser — without this, authenticated briefly goes
  // false → createRoleLabel returns "Unavailable" for PIC/On-Call.
  const pendingAuthValidation =
    (sessionToken?.length ?? 0) > 0 &&
    !currentUser &&
    !loggedOut &&
    !refreshedSession.isError

  return (
    <TethysApiContext.Provider
      value={{
        login,
        token: currentUser?.token,
        logout,
        error,
        authenticated: currentUser?.token?.length ?? 0 ? true : false,
        profile: currentUser,
        loading:
          loginUser.isLoading ||
          refreshedSession.isLoading ||
          pendingAuthValidation,
        axiosInstance: instance.current,
        siteConfig: siteInfo,
      }}
    >
      {children}
    </TethysApiContext.Provider>
  )
}
