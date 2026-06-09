import { Configuration, LogLevel } from '@azure/msal-browser'

// MBARI tenant (Microsoft Entra ID)
// Well-known OIDC config:
// https://login.microsoftonline.com/16ac1ee8-602c-4ca1-944d-3a84bcb35575/v2.0/.well-known/openid-configuration
const TENANT_ID = '16ac1ee8-602c-4ca1-944d-3a84bcb35575'

// IMPORTANT: The redirect URIs registered in the Entra ID app registration
// are currently set for server-side callback handlers. Since this app is a
// static export served by nginx, the registered redirect URIs must be updated
// to point to the static app root:
//   https://sinkerdev.shore.mbari.org/sinker/
//   https://sinker.shore.mbari.org/sinker/
//
// Set NEXT_PUBLIC_MSAL_REDIRECT_URI in .env.local to match the deployment.
// This app is served under a subpath (e.g. /sinker/), so the origin root is
// NOT a valid redirect URI — always set the env var explicitly in each env.
const redirectUri = (() => {
  if (typeof window === 'undefined') return '/' // prerender/SSR — never used
  const configured = process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI
  if (!configured) {
    // This app is served under a subpath (e.g. /sinker/), so the origin root
    // is NOT a valid redirect URI. Fail fast with a clear message rather than
    // silently falling back to window.location.origin which will break SSO.
    console.error(
      '[MSAL] NEXT_PUBLIC_MSAL_REDIRECT_URI is not set. ' +
        'SSO will fail unless this matches the registered redirect URI in Entra ID. ' +
        'Set NEXT_PUBLIC_MSAL_REDIRECT_URI in .env.local to the full redirect URI ' +
        '(e.g. https://sinker.shore.mbari.org/sinker/).'
    )
    // Use current href as a best-effort fallback so MSAL can at least
    // initialise without throwing; the redirect will still fail if the URI
    // is not registered in Entra ID.
    return window.location.href
  }
  return configured
})()

export const msalConfig: Configuration = {
  auth: {
    clientId:
      process.env.NEXT_PUBLIC_MSAL_CLIENT_ID ??
      '2f3b2230-be51-46c5-bac0-2e887bfea35c',
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    // sessionStorage limits token lifetime to the tab session, reducing XSS exposure.
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii || process.env.NODE_ENV === 'production') return
        if (level === LogLevel.Error) console.error('[MSAL]', message)
        if (level === LogLevel.Warning) console.warn('[MSAL]', message)
      },
    },
  },
}

// Scopes for the Microsoft ID token.
// Roles (operator / read-only) are embedded in the ID token by Entra ID
// without needing an extra scope — they are part of the app registration.
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
}
