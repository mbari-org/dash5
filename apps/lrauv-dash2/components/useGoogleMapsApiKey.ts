import { useState, useEffect, useContext } from 'react'
import { TethysApiContext } from '@mbari/api-client'
import toast, { Toaster } from 'react-hot-toast'

export function useGoogleMapsApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const tethysApi = useContext(TethysApiContext) as {
    client?: { get: (url: string) => Promise<any> }
  }
  const configEndpoint =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '/api/info'
  const retryAttempts = 3

  useEffect(() => {
    async function fetchApiKey() {
      // If we're in production and have a build-time API key, use it directly
      // This respects the key set in release.yml
      if (
        process.env.NODE_ENV === 'production' &&
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      ) {
        setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
        setIsLoading(false)
        return
      }
      if (!tethysApi || !tethysApi.client) {
        // Fall back to environment variable if available
        if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
          setIsLoading(false)
        } else {
          setError(new Error('Tethys API client not available'))
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch the config using the existing API client
        const response = await tethysApi.client.get(configEndpoint)

        // Extract the API key from the response
        const googleApiKey = response.data?.result?.appConfig?.googleApiKey

        if (!googleApiKey) {
          throw new Error('Google Maps API key not found in response')
        }

        // Add this debugging code here
        if (googleApiKey) {
          const obscuredKey =
            googleApiKey.substring(0, 4) +
            '...' +
            googleApiKey.substring(googleApiKey.length - 4)
          console.info(
            `Retrieved Google Maps API key (obscured): ${obscuredKey}`
          )

          // Also log any domain restrictions from the response if available
          if (response.data?.result?.appConfig?.googleApiRestrictions) {
            console.info(
              `API restrictions: ${JSON.stringify(
                response.data.result.appConfig.googleApiRestrictions
              )}`
            )
          }

          // Check if we're in development or on a restricted domain
          const hostname =
            typeof window !== 'undefined' ? window.location.hostname : ''
          const isDevelopment = process.env.NODE_ENV === 'development'
          const isLocalhost =
            hostname === 'localhost' || hostname === '127.0.0.1'

          if (
            isDevelopment &&
            isLocalhost &&
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          ) {
            setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
            console.info('Using development API key for localhost', {
              duration: 3000,
            })
          } else {
            setApiKey(googleApiKey)
            console.info('Using production API key from server', {
              duration: 3000,
            })
          }
          console.info(
            `Environment: ${isDevelopment ? 'Development' : 'Production'}`
          )
          console.info(`Hostname: ${hostname}`)
        }

        // setApiKey(googleApiKey)
      } catch (err) {
        console.error('Error fetching Google Maps API key:', err)

        // Fall back to environment variable if available
        if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
        } else {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch API key')
          )
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKey()
  }, [tethysApi, configEndpoint])

  return { apiKey, isLoading, error }
}
