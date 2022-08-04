import { useEffect } from 'react'
import Router from 'next/router'
import { useTethysApiContext } from '@mbari/api-client'

/**
 * Adapted from official next.js example utilizing iron-session:
 * https://github.com/vercel/next.js/blob/canary/examples/with-iron-session/lib/useUser.ts
 */
export default function useAuthenticatedRedirect({
  redirectTo = '',
  redirectIfAuthenticated = false,
} = {}) {
  const { authenticated, loading } = useTethysApiContext()

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || loading) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfAuthenticated && !authenticated) ||
      // If redirectIfAuthenticated is also set, redirect if the user was authenticated
      (redirectIfAuthenticated && authenticated)
    ) {
      Router.push(redirectTo)
    }
  }, [authenticated, redirectIfAuthenticated, redirectTo, loading])
}
