import { createLogger } from './logger'

const logger = createLogger('GoogleMapsLoader')

// Ensure Google Maps API is loaded only once with singleton pattern
let googleMapsPromise: Promise<void> | null = null
const GOOGLE_MAPS_LOADED_FLAG = '_googleMapsElementsRegistered'

// Global flag to avoid redefining elements
declare global {
  interface Window {
    [GOOGLE_MAPS_LOADED_FLAG]?: boolean
    google?: any
  }
}

/**
 * Loads the Google Maps API once and prevents duplicate element registrations
 * Returns a promise that resolves when Google Maps is ready to use
 */
const loadGoogleMapsOnce = (): Promise<void> => {
  // If loading, return the existing promise
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  // If Google Maps is already available, return a resolved promise
  if (typeof window !== 'undefined' && window.google?.maps) {
    logger.debug('Google Maps API already loaded')
    window[GOOGLE_MAPS_LOADED_FLAG] = true
    return Promise.resolve()
  }

  // If already marked as loaded by the flag...
  if (typeof window !== 'undefined' && window[GOOGLE_MAPS_LOADED_FLAG]) {
    logger.debug('Google Maps elements already registered')
    return Promise.resolve()
  }

  // Otherwise create a new promise to load Google Maps
  googleMapsPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load Google Maps in server environment'))
      return
    }

    logger.debug('Loading Google Maps API...')

    // Find Google Maps API key
    const googleApiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      ''

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=elevation`
    script.async = true
    script.defer = true

    script.onload = () => {
      logger.info('Google Maps API loaded successfully')
      // Set flag to prevent duplicate element registration
      window[GOOGLE_MAPS_LOADED_FLAG] = true
      resolve()
    }

    script.onerror = (error) => {
      logger.error('Failed to load Google Maps API:', error)
      googleMapsPromise = null // Allow retry
      reject(error)
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

export default loadGoogleMapsOnce
export { loadGoogleMapsOnce }
