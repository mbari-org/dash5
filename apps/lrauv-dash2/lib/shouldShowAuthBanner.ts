export const AUTH_BANNER_DISMISS_KEY = 'dash5.hideAuthBanner'

export function shouldShowAuthBanner({
  mounted,
  authenticated,
  authLoading,
  dismissed,
}: {
  mounted: boolean
  authenticated: boolean
  authLoading: boolean
  dismissed: boolean
}): boolean {
  return Boolean(mounted && !authenticated && !authLoading && !dismissed)
}
