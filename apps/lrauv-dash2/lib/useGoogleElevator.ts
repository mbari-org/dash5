import { useCallback, useRef, useEffect, useState } from 'react'
import { getElevationService, getCachedElevation } from './elevationService'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'

const logger = createLogger('useGoogleElevator')

interface DepthResult {
  depth: number | null
  status: 'success' | 'error' | 'no-data' | 'unavailable'
}

export function useElevator() {
  const elevationErrorShown = useRef(false)
  const depthLoading = useRef(false)
  const lastKnownDepth = useRef<number | null>(null)

  const [elevationAvailable, setElevationAvailable] = useState<boolean | null>(
    null
  )

  // Initialize elevation service on mount
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
          const result = await elevationService.getElevationForLocations(
            request
          )

          // Process result
          const elevation = Math.abs(result?.results?.[0]?.elevation) ?? null
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
