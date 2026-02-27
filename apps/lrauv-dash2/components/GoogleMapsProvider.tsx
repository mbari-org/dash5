import React, { useState, useEffect } from 'react'
import { useGoogleMapsApiKey } from './useGoogleMapsApiKey'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'
import { initLeafletGoogle } from '../lib/leafletPlugins'

const logger = createLogger('GoogleMapsProvider')

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const { apiKey, isLoading, keySource } = useGoogleMapsApiKey()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setIsLoaded(true)
      logger.debug('Google Maps already available on mount')
    }
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (keySource === 'server') {
      logger.debug('Using Google Maps from Tethys API')
    } else if (keySource === 'local') {
      logger.debug('Using Google Maps from local .env')
    } else if (keySource === 'none' && !apiKey) {
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

    if (window.google?.maps) {
      logger.debug('Google Maps already loaded via window.google')
      setIsLoaded(true)
      return
    }

    if (!apiKey) return

    logger.debug('Loading Google Maps API via initializer')
    initLeafletGoogle(apiKey)
      .then(() => {
        logger.debug('✅ Google Maps API and Leaflet plugins ready')
        setIsLoaded(true)
      })
      .catch((e) => {
        logger.error('❌ Google Maps initializer failed:', e)
        toast.error('Google Hybrid map unavailable', {
          duration: 3000,
          id: 'maps-loading-error',
        })
      })
  }, [isLoading, keySource, apiKey])

  if (isLoading) {
    return <div className="opacity-0">Loading maps...</div>
  }

  return <>{children}</>
}
