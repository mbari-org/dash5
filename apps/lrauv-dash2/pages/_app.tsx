import '@mbari/react-ui/dist/mbari-ui.css'
import { AppProps } from 'next/app'
import { QueryClientProvider, QueryClient } from 'react-query'
const queryClient = new QueryClient()
import { AuthProvider } from '@mbari/api-client'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'
import useSessionToken from '../lib/useSessionToken'

function MyApp({ Component, pageProps }: AppProps) {
  const { sessionToken, setSessionToken } = useSessionToken(
    'TETHYS_SESSION_TOKEN'
  )
  const handleSessionEnd = () => setSessionToken('')
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        baseURL={process.env.NEXT_PUBLIC_BASE_URL}
        sessionToken={sessionToken}
        setSessionToken={setSessionToken}
        onSessionEnd={handleSessionEnd}
      >
        <Component {...pageProps} />
      </AuthProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MyApp
