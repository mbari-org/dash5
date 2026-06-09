import { useCallback } from 'react'
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { loginRequest } from './msalConfig'

export interface MbariAccount {
  name: string | undefined
  email: string | undefined
  roles: string[]
}

/**
 * Primary hook for MBARI SSO state. Wraps MSAL so the rest of the app
 * doesn't need to import from @azure/msal-react directly.
 */
export const useMbariAuth = () => {
  const { instance, accounts, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const account = useAccount(accounts[0] ?? null)

  const roles: string[] =
    (account?.idTokenClaims as { roles?: string[] } | null)?.roles ?? []

  const mbariAccount: MbariAccount | null = account
    ? {
        name: account.name,
        email: account.username,
        roles,
      }
    : null

  const login = useCallback(() => {
    instance.loginRedirect(loginRequest).catch(console.error)
  }, [instance])

  const logout = useCallback(() => {
    instance
      .logoutRedirect({ account: account ?? undefined })
      .catch(console.error)
  }, [instance, account])

  /**
   * Silently acquire the current ID token. Returns null if no account is
   * active or the silent refresh fails. Call this once on mount to get the
   * token to pass to TethysApiProvider as the session token.
   */
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!account) return null
    try {
      const result = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      })
      return result.idToken
    } catch {
      return null
    }
  }, [instance, account])

  return {
    account: mbariAccount,
    isAuthenticated,
    isLoading: inProgress !== InteractionStatus.None,
    roles,
    login,
    logout,
    getIdToken,
  }
}
