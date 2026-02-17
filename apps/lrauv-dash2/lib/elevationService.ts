import { createLogger } from '@mbari/utils'

// Extend the Window interface
declare global {
  interface Window {
    [GOOGLE_MAPS_LOADED_FLAG]?: boolean
    google?: any
  }
}

const logger = createLogger('ElevationService')
const GOOGLE_MAPS_LOADED_FLAG = '_googleMapsElementsRegistered'

// Singleton instance of the ElevationService
let elevatorInstance: google.maps.ElevationService | null = null
let isInitializing = false
let initPromise: Promise<google.maps.ElevationService> | null = null

export const getElevationService =
  (): Promise<google.maps.ElevationService> => {
    // If already initialized, return the instance
    if (elevatorInstance) {
      return Promise.resolve(elevatorInstance)
    }

    // If currently initializing, return the promise
    if (initPromise) {
      return initPromise
    }

    // Start initialization
    isInitializing = true

    initPromise = new Promise<google.maps.ElevationService>(
      (resolve, reject) => {
        // Check if Google Maps API is available
        if (typeof window === 'undefined') {
          reject(new Error('Cannot initialize in server environment'))
          return
        }

        // Check if already loaded using flag
        if (window[GOOGLE_MAPS_LOADED_FLAG]) {
          logger.debug('Skipping Google Maps initialization - already loaded')
        } else if (window.google?.maps) {
          // Set flag to prevent duplicate initialization
          window[GOOGLE_MAPS_LOADED_FLAG] = true
        }

        // Wait for Google Maps API to load
        const checkGoogleMaps = () => {
          if (window.google?.maps?.ElevationService) {
            try {
              // Create instance first, then assign
              const serviceInstance = new window.google.maps.ElevationService()
              elevatorInstance = serviceInstance
              logger.info('✅ Elevation service initialized after wait')
              resolve(serviceInstance) // Resolve with instance, not the variable
              return true
            } catch (error) {
              logger.error(
                '❌ Failed to create elevation service after wait:',
                error
              )
              reject(error)
              return false // Prevent further attempts
            }
          }
          return false
        }

        // Check immediately
        if (checkGoogleMaps()) {
          return
        }

        // Set up polling
        const maxAttempts = 20
        let attempts = 0
        const interval = setInterval(() => {
          attempts++
          if (checkGoogleMaps() || attempts >= maxAttempts) {
            clearInterval(interval)
            if (!elevatorInstance && attempts >= maxAttempts) {
              const error = new Error('Timed out waiting for Google Maps API')
              logger.error('⏱️ Elevation service initialization timed out')
              reject(error)
            }
          }
        }, 200)
      }
    )

    return initPromise
  }

// Cache for elevation data - may help reduce API calls
const elevationCache = new Map<string, number>()

export const getCachedElevation = async (
  lat: number,
  lng: number
): Promise<number | null> => {
  // Create cache key
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`

  // Check cache first
  if (elevationCache.has(key)) {
    return elevationCache.get(key)!
  }

  try {
    // Get elevation service
    const elevator = await getElevationService()

    // Make the request
    const response = await elevator.getElevationForLocations({
      locations: [{ lat, lng }],
    })

    if (response.results?.[0]) {
      const elevation = Math.abs(response.results[0].elevation)
      // Cache the result
      elevationCache.set(key, elevation)
      return elevation
    }

    return null
  } catch (error) {
    logger.error('Error getting elevation!:', error)
    return null
  }
}
