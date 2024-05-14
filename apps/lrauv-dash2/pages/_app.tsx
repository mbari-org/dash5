import '@mbari/react-ui/dist/mbari-ui.css'
import 'react-quill/dist/quill.snow.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import 'leaflet/dist/leaflet.css'
import { AppProps } from 'next/app'
import { QueryClientProvider, QueryClient } from 'react-query'
import { TethysApiProvider } from '@mbari/api-client'
import { UIProvider } from '@mbari/react-ui'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'
import { CookiesProvider } from 'react-cookie'
import useSessionToken from '../lib/useSessionToken'
import '../styles/vehicle.css'

// prevent font awesome from auto-adding styles.
config.autoAddCss = false

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const { sessionToken, setSessionToken } = useSessionToken(
    'TETHYS_SESSION_TOKEN'
  )
  const handleSessionEnd = () => setSessionToken('')
  return (
    <QueryClientProvider client={queryClient}>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <UIProvider>
          <TethysApiProvider
            baseURL={process.env.NEXT_PUBLIC_BASE_URL}
            sessionToken={sessionToken}
            setSessionToken={setSessionToken}
            onSessionEnd={handleSessionEnd}
          >
            <Component {...pageProps} />
          </TethysApiProvider>
        </UIProvider>
      </CookiesProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MyApp
