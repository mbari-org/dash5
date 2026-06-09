import '@mbari/react-ui/dist/mbari-ui.css'
import 'react-quill/dist/quill.snow.css'
import 'tippy.js/dist/tippy.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import 'leaflet/dist/leaflet.css'
import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
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
  const { getIdToken, isAuthenticated, isLoading } = useMbariAuth()
  const { sessionToken, setSessionToken } = useSessionToken(
    'TETHYS_SESSION_TOKEN'
  )

  // Sync the MSAL session state with the TethysDash session token:
  // - Authenticated: silently acquire the ID token and store it.
  // - Unauthenticated (and MSAL has finished initializing): clear any stale token
  //   so API calls don't continue with an expired credential after logout.
  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) {
      getIdToken().then((token) => {
        // Clear on silent-acquisition failure so a stale credential isn't reused.
        if (token) setSessionToken(token)
        else setSessionToken('')
      })
    } else {
      setSessionToken('')
    }
  }, [isAuthenticated, isLoading, getIdToken, setSessionToken])

  const handleSessionEnd = () => setSessionToken('')

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
  // Defer rendering until after hydration so the client's initial render
  // matches the server's (both return null), avoiding a React hydration mismatch.
  // MSAL is browser-only; there is no meaningful shell to render without it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !msalInstance) return null

  return (
    <MsalProvider instance={msalInstance}>
      <AppWithAuth {...props} />
    </MsalProvider>
  )
}

export default MyApp
