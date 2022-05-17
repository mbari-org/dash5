import '@mbari/react-ui/dist/mbari-ui.css'
import { AppProps } from 'next/app'
import { QueryClientProvider, QueryClient } from 'react-query'
const queryClient = new QueryClient()
import { AuthProvider } from '@mbari/api-client'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider baseURL={process.env.NEXT_PUBLIC_BASE_URL}>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default MyApp
