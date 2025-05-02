import { useCallback, useRef, useEffect, useState } from 'react'
import { getElevationService, getCachedElevation } from './elevationService'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'
import axios from 'axios'
import { setConfigApiKey } from './elevationService'

const logger = createLogger('useGoogleElevator')

interface DepthResult {
  depth: number | null
  status: 'success' | 'error' | 'no-data' | 'unavailable'
}

const fetchApiKeyFromServer = async () => {
  try {
    const response = await axios.get(
      'https://okeanids.mbari.org/TethysDash/api/info'
    )
    return response.data?.result?.appConfig?.googleApiKey || null
  } catch (error) {
    logger.error('Failed to fetch API key from server:', error)
    return null
  }
}

export function useElevator() {
  const elevationErrorShown = useRef(false)
  const depthLoading = useRef(false)
  const lastKnownDepth = useRef<number | null>(null)
  const [configApiKey, setConfigApiKey] = useState<string | null>(null)
  const [elevationAvailable, setElevationAvailable] = useState<boolean | null>(
    null
  )

  // Fetch API key from server on mount
  useEffect(() => {
    fetchApiKeyFromServer().then((apiKey) => {
      setConfigApiKey(apiKey) // Store it in elevationService
      setConfigApiKey(apiKey) // Also store it in local state

      // Debug which key is being used
      logger.debug('API Key source check:', {
        fromEnv:
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 5) + '...',
        fromConfig: apiKey?.substring(0, 5) + '...',
        isEnvDefined: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        isConfigDefined: !!apiKey,
      })
    })
  }, [])

  // Call this immediately on mount to start initializing the service
  useEffect(() => {
    getElevationService()
      .then(() => {
        setElevationAvailable(true)
        logger.info('👍 Elevation service ready')
      })
      .catch(() => {
        setElevationAvailable(false)
        logger.warn('⚠️ Elevation service unavailable')
      })
  }, [])

  const handleDepthRequest = useCallback(
    async (lat: number, lng: number): Promise<DepthResult> => {
      try {
        // Try to get cached elevation first
        const cachedElevation = await getCachedElevation(lat, lng)
        if (cachedElevation !== null) {
          lastKnownDepth.current = cachedElevation
          return { depth: cachedElevation, status: 'success' }
        }

        // Get elevation service
        const elevationService = await getElevationService()

        // Prepare the request
        const request = {
          locations: [{ lat, lng }],
        }

        // Make the API request
        try {
          // Add null check before using elevationService
          if (!elevationService) {
            logger.warn('Elevation service is not available')
            return { depth: null, status: 'unavailable' } // Elevation service unavailable
          }

          const result = await elevationService.getElevationForLocations(
            request
          )

          // Process result
          const elevation = result?.results?.[0]?.elevation ?? null
          lastKnownDepth.current = elevation

          return {
            depth: elevation,
            status: elevation !== null ? 'success' : 'no-data',
          }
        } catch (apiError) {
          logger.warn('⚠️ Elevation API call failed:', apiError)
          return { depth: null, status: 'error' }
        }
      } catch (error) {
        logger.error('❌ Depth request error:', error)
        return { depth: null, status: 'error' }
      }
    },
    []
  )

  return {
    elevationAvailable,
    handleDepthRequest,
  }
}

export default useElevator
