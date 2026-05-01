import '@mbari/react-ui/dist/mbari-ui.css'
import 'react-quill/dist/quill.snow.css'
import 'tippy.js/dist/tippy.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import 'leaflet/dist/leaflet.css'
import { AppProps } from 'next/app'
import { useEffect } from 'react'
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
import '../styles/vehicle.css'
import '../styles/docs.css'

// prevent font awesome from auto-adding styles.
config.autoAddCss = false

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Fix Leaflet's default marker icon paths broken by webpack/Next.js bundling.
    // Must run client-side only — Leaflet references `window` at import time.
    // Images are copied to /public so they're served at the root.
    import('leaflet').then((L) => {
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconUrl: '/marker-icon.png',
        iconRetinaUrl: '/marker-icon-2x.png',
        shadowUrl: '/marker-shadow.png',
      })
    })
  }, [])

  const { sessionToken, setSessionToken } = useSessionToken(
    'TETHYS_SESSION_TOKEN'
  )
  const handleSessionEnd = () => setSessionToken('')
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

export default MyApp
