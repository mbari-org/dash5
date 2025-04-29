import { useState, useEffect, useContext } from 'react'
import { TethysApiContext } from '@mbari/api-client'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'

const logger = createLogger('useGoogleMapsApiKey')

export function useGoogleMapsApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [keySource, setKeySource] = useState<
    'server' | 'local' | 'direct' | 'none'
  >('none')

  // Type assertion for the API context
  const tethysApi = useContext(TethysApiContext) as {
    client?: { get: (url: string) => Promise<any> }
  }

  useEffect(() => {
    async function fetchApiKey() {
      try {
        // FIRST PRIORITY: Try to fetch from the Tethys API using context
        if (tethysApi && tethysApi.client) {
          try {
            logger.debug(
              '🔍 Attempting to fetch API key from Tethys API client...'
            )
            const response = await tethysApi.client.get('/api/info')
            const googleApiKey = response.data?.result?.appConfig?.googleApiKey

            if (googleApiKey) {
              logger.debug(
                '✅ Successfully retrieved API key from Tethys API client'
              )
              setApiKey(googleApiKey)
              setKeySource('server')
              setIsLoading(false)
              return
            } else {
              logger.debug('⚠️ API key not found in Tethys API client response')
            }
          } catch (apiError) {
            logger.error('⚠️ Error fetching from Tethys API client:', apiError)
            // Continue to fallback - don't throw here
          }
        } else {
          logger.debug('ℹ️ Tethys API client not available')
          // logger.debug(
          //   'Tethys API client check:',
          //   !!tethysApi,
          //   !!tethysApi?.client
          // )
        }

        // SECOND PRIORITY: Try direct fetch from TethysDash endpoint
        try {
          logger.debug('🔍 Attempting direct fetch from TethysDash API...')
          const response = await fetch(
            'https://okeanids.mbari.org/TethysDash/api/info',
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              // Include credentials if needed for cookies
              // credentials: 'include',
            }
          )

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }

          const data = await response.json()
          const directApiKey = data?.result?.appConfig?.googleApiKey

          if (directApiKey) {
            logger.debug(
              '✅ Successfully retrieved API key from direct TethysDash fetch'
            )
            setApiKey(directApiKey)
            setKeySource('direct')
            setIsLoading(false)
            return
          } else {
            logger.debug('⚠️ API key not found in direct TethysDash response')
          }
        } catch (directError) {
          logger.error('⚠️ Error with direct TethysDash fetch:', directError)
          // Continue to next fallback - don't throw
        }

        // THIRD PRIORITY: Fall back to environment variable
        if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          logger.debug(
            '✅ Falling back to Google Maps API key from environment'
          )
          setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
          setKeySource('local')
          setIsLoading(false)
          return
        }

        // If we get here, all methods failed - BUT DON'T THROW
        logger.warn('⚠️ No Google Maps API key available from any source')
        setKeySource('none')
        setError(
          new Error('Unable to obtain Google Maps API key from any source')
        )

        // Silent notification instead of throwing
        toast.error(
          '⚠️ Google Maps API unavailable!\nMaps functionality limited',
          {
            duration: 4000,
            id: 'maps-api-missing',
            className: 'blue-toast',
          }
        )
      } catch (err) {
        // This catch block now only catches unexpected errors
        logger.error('❌ Error obtaining Google Maps API key:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error fetching API key'
        setError(new Error(errorMessage))

        toast.error('Maps API unavailable', {
          duration: 4000,
          id: 'maps-api-error',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKey()
  }, [tethysApi])

  return { apiKey, isLoading, error, keySource }
}
