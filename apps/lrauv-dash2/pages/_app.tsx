import '@mbari/react-ui/dist/mbari-ui.css'
import 'react-quill/dist/quill.snow.css'
import 'tippy.js/dist/tippy.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import 'leaflet/dist/leaflet.css'
import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { createLogger } from '@mbari/utils'
import { QueryClientProvider, QueryClient } from 'react-query'
import { TethysApiProvider } from '@mbari/api-client'
import { UIProvider } from '@mbari/react-ui'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'
import { MarkerProvider } from '../components/MarkerContext'
import { CookiesProvider } from 'react-cookie'
import useSessionToken from '../lib/useSessionToken'
import { GoogleMapsProvider } from '../components/GoogleMapsProvider'
import { VehicleColorsProvider } from '../components/VehicleColorsContext'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from '../lib/msalConfig'
import { useMbariAuth } from '../lib/useMbariAuth'
import '../styles/vehicle.css'
import '../styles/docs.css'

// prevent font awesome from auto-adding styles.
config.autoAddCss = false

const logger = createLogger('App')

const queryClient = new QueryClient()

// Guard against Node prerender environment — @azure/msal-browser v5 supports
// SSR, but we only need a real instance in the browser where window exists.
const msalInstance =
  typeof window !== 'undefined' ? new PublicClientApplication(msalConfig) : null

/**
 * Inner component so useMbariAuth (which requires MsalProvider) can be called
 * after the provider is mounted in the tree.
 */
function AppWithAuth({ Component, pageProps }: AppProps) {
  const { getIdToken, isAuthenticated, isLoading, logout } = useMbariAuth()
  const { sessionToken, setSessionToken } = useSessionToken(
    'TETHYS_SESSION_TOKEN'
  )

  // Only sync the cookie when MSAL has an active session — do NOT touch the
  // cookie when !isAuthenticated, because that would clear a valid non-MSAL
  // (username/password) session that was already in the cookie on page load.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    getIdToken().then((token) => {
      // Clear on silent-acquisition failure so a stale MSAL credential isn't reused.
      if (token) setSessionToken(token)
      else setSessionToken('')
    })
  }, [isAuthenticated, isLoading, getIdToken, setSessionToken])

  // Called by TethysApiProvider when the server returns 401 (or the user
  // triggers logout from the UI). Clears both the cookie and the MSAL session
  // so the effect above cannot immediately repopulate the cookie.
  const handleSessionEnd = () => {
    setSessionToken('')
    if (isAuthenticated) logout()
  }

  useEffect(() => {
    // Fix Leaflet's default marker icon paths broken by webpack/Next.js bundling.
    // Must run client-side only — Leaflet references `window` at import time.
    // Images are copied to /public so they're served at the root.
    import('leaflet')
      .then((L) => {
        const leaflet = L.default ?? L
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
        })
      })
      .catch((err) => {
        logger.debug(
          'Leaflet marker icon setup failed — default markers may be missing:',
          err
        )
      })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <UIProvider>
          <VehicleColorsProvider>
            <MarkerProvider>
              <TethysApiProvider
                baseURL={process.env.NEXT_PUBLIC_BASE_URL}
                sessionToken={sessionToken}
                setSessionToken={setSessionToken}
                onSessionEnd={handleSessionEnd}
              >
                <GoogleMapsProvider>
                  <Component {...pageProps} />
                </GoogleMapsProvider>
              </TethysApiProvider>
            </MarkerProvider>
          </VehicleColorsProvider>
        </UIProvider>
      </CookiesProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

function MyApp(props: AppProps) {
  // Defer full rendering until after hydration to avoid a React hydration mismatch:
  // the static prerender and the client's first render both return the same minimal
  // <Head> shell (title + viewport meta). Once useEffect fires, the full MSAL-wrapped
  // app replaces it. MSAL is browser-only so there is no meaningful content to render
  // server-side.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !msalInstance) {
    // Return a minimal shell so <Head> content (page title, meta) is present in
    // the static HTML and during the brief pre-hydration window.
    return (
      <Head>
        <title>LRAUV Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    )
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AppWithAuth {...props} />
    </MsalProvider>
  )
}

export default MyApp
