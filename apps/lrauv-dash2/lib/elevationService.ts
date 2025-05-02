import { createLogger } from '@mbari/utils'

// Extend the Window interface with proper typing
declare global {
  interface Window {
    [GOOGLE_MAPS_LOADED_FLAG]?: boolean
    google?: any
    initMap?: () => void
  }
}

const logger = createLogger('ElevationService')
const GOOGLE_MAPS_LOADED_FLAG = '_googleMapsElementsRegistered'

// Configuration
const CONFIG = {
  CACHE_SIZE_LIMIT: 1000, // Maximum number of cached elevation points
  MAX_RETRY_ATTEMPTS: 3, // Maximum retry attempts for failed requests
  RETRY_DELAY_MS: 1000, // Delay between retries (milliseconds)
  INITIALIZATION_TIMEOUT_MS: 10000, // Timeout for API initialization
  POLLING_INTERVAL_MS: 200, // Polling interval during initialization
  MAX_POLLING_ATTEMPTS: 50, // Maximum polling attempts (50 * 200ms = 10s)
}

// --------------------------------
// Service state management
// --------------------------------
let elevatorInstance: google.maps.ElevationService | null = null
let isInitializing = false
let initPromise: Promise<google.maps.ElevationService | null> | null = null
let lastError: Error | null = null
let serverProvidedApiKey: string | null = null
let googleMapsLoadPromise: Promise<void> | null = null
let scriptElement: HTMLScriptElement | null = null

/**
 * Loads Google Maps API with proper error handling and duplicate prevention
 */
export const loadGoogleMapsApi = (): Promise<void> => {
  // Return existing promise if already loading
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise
  }

  // Return resolved promise if already loaded
  if (window[GOOGLE_MAPS_LOADED_FLAG] && window.google?.maps) {
    logger.debug('Google Maps API already loaded')
    return Promise.resolve()
  }

  // Create promise for script loading
  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Check for existing script tags
      const existingScripts = Array.from(
        document.getElementsByTagName('script')
      )
      const mapsScript = existingScripts.find(
        (script) =>
          script.src && script.src.includes('maps.googleapis.com/maps/api')
      )

      // If script exists but API not loaded yet, wait for it
      if (mapsScript) {
        logger.debug(
          'Found existing Google Maps script, waiting for it to load'
        )
        const checkLoaded = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkLoaded)
            window[GOOGLE_MAPS_LOADED_FLAG] = true
            resolve()
          }
        }, 100)
        return
      }

      // Get API key
      const getGoogleMapsApiKey = () => {
        // Detailed logging to diagnose key source
        const configKey = getConfigApiKey()
        const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

        // Log key sources (safely)
        logger.debug('API Key Sources:', {
          hasServerKey: !!configKey,
          hasEnvKey: !!envKey,
          serverKeyPrefix: configKey ? configKey.substring(0, 6) : 'none',
          envKeyPrefix: envKey ? envKey.substring(0, 6) : 'none',
          usingSource: configKey ? 'SERVER' : envKey ? 'ENV' : 'NONE',
        })

        // Standard precedence logic
        if (configKey) return configKey
        return envKey || ''
      }

      // Get the API key value by calling the function
      const apiKey = getGoogleMapsApiKey()

      // Create script element
      scriptElement = document.createElement('script')
      scriptElement.type = 'text/javascript'
      scriptElement.async = true
      scriptElement.defer = true

      // Add priority hints for better loading performance
      scriptElement.setAttribute('importance', 'low')

      // Set the source with the API key
      scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initMap`

      // Define global callback function
      window.initMap = () => {
        window[GOOGLE_MAPS_LOADED_FLAG] = true
        logger.info('✅ Google Maps API loaded successfully')
        resolve()
      }

      scriptElement.onerror = () => {
        const error = new Error('Failed to load Google Maps API')
        logger.error('❌ ' + error.message)
        reject(error)
      }

      // Append to document
      document.head.appendChild(scriptElement)
    } catch (error) {
      reject(error)
    }
  })

  return googleMapsLoadPromise
}

/**
 * Sets the Google Maps API key from the server
 * @param apiKey The API key to use for Google Maps requests
 */
export const setConfigApiKey = (apiKey: string | null) => {
  if (apiKey) {
    serverProvidedApiKey = apiKey
    logger.debug('Server-provided Google Maps API key set')

    // Log diagnostic info without exposing full key
    if (apiKey.length > 8) {
      const keyPrefix = apiKey.substring(0, 4)
      const keySuffix = apiKey.substring(apiKey.length - 4)
      logger.debug(`API key set: ${keyPrefix}...${keySuffix}`)
    }

    // If we had a previous error, reset the service to try again with the new key
    if (lastError) {
      logger.info('Resetting elevation service due to new API key')
      resetElevationService()
    }
  } else {
    logger.warn('Attempted to set null/empty API key')
  }
}

/**
 * Gets the server-provided Google Maps API key
 * @returns The API key or null if not set
 */
export const getConfigApiKey = (): string | null => {
  return serverProvidedApiKey
}

// Enhanced cache with LRU behavior
class ElevationCache {
  private cache = new Map<string, number>()
  private keyTimestamps = new Map<string, number>()
  private size: number = 0
  private readonly maxSize: number

  constructor(maxSize: number = CONFIG.CACHE_SIZE_LIMIT) {
    this.maxSize = maxSize
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  get(key: string): number | null {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Update timestamp on access (LRU behavior)
      this.keyTimestamps.set(key, Date.now())
      return value
    }
    return null
  }

  set(key: string, value: number): void {
    // Evict oldest entry if at capacity
    if (this.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    if (!this.cache.has(key)) {
      this.size++
    }

    this.cache.set(key, value)
    this.keyTimestamps.set(key, Date.now())
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, timestamp] of Array.from(this.keyTimestamps.entries())) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.keyTimestamps.delete(oldestKey)
      this.size--
    }
  }

  clear(): void {
    this.cache.clear()
    this.keyTimestamps.clear()
    this.size = 0
  }

  get stats(): { size: number; maxSize: number } {
    return {
      size: this.size,
      maxSize: this.maxSize,
    }
  }
}

// Initialize cache
const elevationCache = new ElevationCache(CONFIG.CACHE_SIZE_LIMIT)

// Check this in elevationService.ts
const getGoogleMapsApiKey = () => {
  // Prioritize server-provided key if available
  const configKey = getConfigApiKey()
  if (configKey) {
    logger.debug('Using server-provided Google Maps API key')
    return configKey
  }

  // Fall back to environment variable
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (envKey) {
    logger.debug('Using environment variable Google Maps API key')
    return envKey
  }

  logger.warn('No Google Maps API key available')
  return ''
}

// Rate limiting implementation
class RateLimiter {
  private requestTimes: number[] = []
  private readonly maxRequestsPerSecond: number

  constructor(maxRequestsPerSecond: number = 10) {
    this.maxRequestsPerSecond = maxRequestsPerSecond
  }

  async waitForAvailableSlot(): Promise<void> {
    // Remove timestamps older than 1 second
    const now = Date.now()
    this.requestTimes = this.requestTimes.filter((time) => now - time < 1000)

    // If at capacity, wait until we can make another request
    if (this.requestTimes.length >= this.maxRequestsPerSecond) {
      const oldestRequest = this.requestTimes[0]
      const timeToWait = 1000 - (now - oldestRequest) + 10 // Add 10ms buffer

      if (timeToWait > 0) {
        logger.debug(`Rate limit reached, waiting ${timeToWait}ms`)
        await new Promise((resolve) => setTimeout(resolve, timeToWait))
      }
    }

    // Record this request
    this.requestTimes.push(Date.now())
  }
}

// Initialize rate limiter (5 requests per second is a safe default)
const rateLimiter = new RateLimiter(5)

// --------------------------------
// Initialization and service handling
// --------------------------------

/**
 * Gets a singleton instance of the Google Maps Elevation Service
 * with enhanced error handling and reliability
 */
export const getElevationService =
  async (): Promise<google.maps.ElevationService | null> => {
    // If already initialized successfully, return the instance
    if (elevatorInstance) {
      return elevatorInstance
    }

    // If there was a previous fatal error, don't retry
    if (lastError) {
      logger.warn(
        `Skipping elevation service - previous fatal error: ${lastError.message}`
      )
      return null
    }

    // If currently initializing, return the existing promise
    if (initPromise) {
      return initPromise
    }

    // Start initialization
    isInitializing = true

    // Create initialization promise with timeout
    initPromise = Promise.race([
      new Promise<google.maps.ElevationService | null>(
        async (resolve, reject) => {
          try {
            // Check if running in browser
            if (typeof window === 'undefined') {
              throw new Error(
                'Cannot initialize elevation service in server environment'
              )
            }

            // Check if Google Maps API is already available
            if (
              window[GOOGLE_MAPS_LOADED_FLAG] &&
              window.google?.maps?.ElevationService
            ) {
              logger.debug('Using existing Google Maps API')
              try {
                elevatorInstance = new window.google.maps.ElevationService()
                isInitializing = false
                resolve(elevatorInstance)
                return
              } catch (e) {
                logger.error(
                  'Failed to create elevation service from existing API:',
                  e
                )
                // Continue with polling approach
              }
            } else {
              logger.debug('Waiting for Google Maps API to become available...')
            }

            // Wait for API to become available through polling
            let attempts = 0
            let delay = CONFIG.POLLING_INTERVAL_MS

            while (attempts < CONFIG.MAX_POLLING_ATTEMPTS) {
              attempts++

              if (window.google?.maps?.ElevationService) {
                try {
                  elevatorInstance = new window.google.maps.ElevationService()
                  window[GOOGLE_MAPS_LOADED_FLAG] = true
                  logger.info(
                    `✅ Elevation service initialized after ${attempts} attempts`
                  )
                  isInitializing = false
                  resolve(elevatorInstance)
                  return
                } catch (e) {
                  logger.warn(`Failed to initialize on attempt ${attempts}:`, e)
                }
              }

              // Wait with exponential backoff (capped at 1000ms)
              await new Promise((r) => setTimeout(r, delay))
              delay = Math.min(delay * 1.5, 1000)
            }

            // If we get here, polling failed
            throw new Error(
              `Elevation service initialization failed after ${attempts} attempts`
            )
          } catch (error) {
            const typedError =
              error instanceof Error ? error : new Error(String(error))
            logger.error(
              '❌ Elevation service initialization error:',
              typedError
            )
            lastError = typedError // Store error for future reference
            isInitializing = false
            resolve(null) // Resolve with null instead of rejecting to prevent unhandled rejections
          }
        }
      ),

      // Timeout promise
      new Promise<null>((resolve) => {
        setTimeout(() => {
          if (isInitializing) {
            logger.error(
              `⏱️ Elevation service initialization timed out after ${CONFIG.INITIALIZATION_TIMEOUT_MS}ms`
            )
            isInitializing = false
            resolve(null)
          }
        }, CONFIG.INITIALIZATION_TIMEOUT_MS)
      }),
    ])

    return initPromise
  }

/**
 * Reset the elevation service state - useful for recovering from errors
 */
export const resetElevationService = (): void => {
  elevatorInstance = null
  initPromise = null
  isInitializing = false
  lastError = null
  logger.info('Elevation service state reset')
}

// --------------------------------
// Main API Functions
// --------------------------------

/**
 * Get elevation data for a specific latitude/longitude with caching,
 * retries, and comprehensive error handling
 */
export const getElevation = async (
  lat: number,
  lng: number,
  retryCount = 0
): Promise<number | null> => {
  // Validate input
  if (
    isNaN(lat) ||
    isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    logger.warn(`Invalid coordinates: lat=${lat}, lng=${lng}`)
    return null
  }

  // Create cache key with precision control to avoid floating-point issues
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`

  // Check cache first
  const cachedValue = elevationCache.get(key)
  if (cachedValue !== null) {
    return cachedValue
  }

  // Wait for rate limiter
  await rateLimiter.waitForAvailableSlot()

  try {
    // Get elevation service
    const elevator = await getElevationService()

    // If service is unavailable, return null
    if (!elevator) {
      logger.warn('Elevation service unavailable')
      return null
    }

    // Make the API request
    const response = await elevator.getElevationForLocations({
      locations: [{ lat, lng }],
    })

    // Validate response structure with detailed logging
    if (!response) {
      logger.warn(`Empty response from elevation service for ${lat},${lng}`)
      return null
    }

    if (!response.results) {
      logger.warn(
        `Missing results array in elevation response for ${lat},${lng}`
      )
      return null
    }

    if (response.results.length === 0) {
      logger.warn(`Empty results array in elevation response for ${lat},${lng}`)
      return null
    }

    // Extract and validate elevation
    const elevation = response.results[0]?.elevation

    if (elevation === undefined || elevation === null) {
      logger.warn(`No elevation value in response for ${lat},${lng}`)
      return null
    }

    // Cache the valid result
    elevationCache.set(key, elevation)
    return elevation
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    logger.error(`Error getting elevation for ${lat},${lng}: ${errorMsg}`)

    // Implement retry logic for transient errors
    if (retryCount < CONFIG.MAX_RETRY_ATTEMPTS) {
      logger.info(
        `Retrying elevation request (${retryCount + 1}/${
          CONFIG.MAX_RETRY_ATTEMPTS
        })`
      )
      await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY_MS))
      return getElevation(lat, lng, retryCount + 1)
    }

    return null
  }
}

/**
 * Get cached elevation data without making an API call
 */
export const getCachedElevation = (lat: number, lng: number): number | null => {
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`
  return elevationCache.get(key)
}

/**
 * Batch process multiple elevation requests efficiently
 */
export const getBatchElevations = async (
  points: Array<[number, number]>
): Promise<Array<number | null>> => {
  // Process in smaller batches to stay within API limits (max 512 locations per request)
  const BATCH_SIZE = 500
  const results: Array<number | null> = []

  // Process in batches
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE)
    const batchPromises = batch.map(([lat, lng]) => getElevation(lat, lng))

    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    } catch (error) {
      logger.error('Error in batch elevation processing:', error)

      // Fill remaining results with nulls on error
      const nulls = new Array(batch.length).fill(null)
      results.push(...nulls)
    }
  }

  return results
}

/**
 * Get elevation service statistics
 */
export const getElevationServiceStats = () => {
  return {
    serviceAvailable: elevatorInstance !== null,
    cacheStats: elevationCache.stats,
    lastError: lastError ? lastError.message : null,
  }
}

// Export for testing and debugging
export const _testing = {
  resetCache: () => elevationCache.clear(),
  CONFIG,
}
