import React, { useState, useEffect } from 'react'
import { useGoogleMapsApiKey } from './useGoogleMapsApiKey'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'

const logger = createLogger('GoogleMapsProvider')

// Global variable to track if script has been loaded
let googleMapsScriptAdded = false

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const { apiKey, isLoading, error, keySource } = useGoogleMapsApiKey()
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if Maps API is already available on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setIsLoaded(true)
      logger.debug('Google Maps already available on mount')
    }
  }, [])

  // Handle script loading based on API key
  useEffect(() => {
    if (isLoading) return

    // Log the source of the API key
    if (keySource === 'server') {
      logger.debug('Using Google Maps from Tethys API')
    } else if (keySource === 'local') {
      logger.debug('Using Google Maps from local .env')
    } else if (keySource === 'none' && !apiKey) {
      // Notify but don't block interface
      toast.error(
        'Google Maps API unavailable - Google Hybrid map and elevation data unavailable‼️ ',
        {
          duration: 6000,
          id: 'maps-api-missing',
          className: 'blue-toast',
        }
      )
      return
    }

    // If Maps already loaded, nothing more to do
    if (window.google?.maps) {
      logger.debug('Google Maps already loaded via window.google')
      setIsLoaded(true)
      return
    }

    // If we already started loading the script, don't add it again
    if (googleMapsScriptAdded) {
      logger.debug('Google Maps script tag already added')
      return
    }

    // Load the script if we have an API key
    if (apiKey) {
      logger.debug('Loading Google Maps API script')

      // Check if script already exists
      const existingScript = document.getElementById('google-maps-script')
      if (existingScript) {
        logger.debug('Found existing Google Maps script tag')
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script'

      script.onload = () => {
        logger.debug('✅ Google Maps API script loaded successfully')
        setIsLoaded(true)
      }

      script.onerror = (e) => {
        logger.error('❌ Google Maps script failed to load:', e)
        toast.error('Google Hybrid map unavailable', {
          duration: 3000,
          id: 'maps-loading-error',
        })
      }

      document.head.appendChild(script)

      // Mark as added to prevent duplicate loading
      googleMapsScriptAdded = true
    }
  }, [isLoading, keySource, apiKey])

  // Just a minimal loading indicator that doesn't take much space
  if (isLoading) {
    return <div className="opacity-0">Loading maps...</div>
  }

  // Always render children - maps will be available when loaded
  // This avoids the flash of content and UI blocking
  return <>{children}</>
}
