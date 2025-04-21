import React, { useState, useEffect } from 'react'
import { useGoogleMapsApiKey } from './useGoogleMapsApiKey'
import { LoadScriptNext } from '@react-google-maps/api'
import toast from 'react-hot-toast'

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const { apiKey, isLoading, error, keySource } = useGoogleMapsApiKey()
  const [isLoaded, setIsLoaded] = useState(false)

  // Show toast notifications but don't block UI
  useEffect(() => {
    if (!isLoading) {
      if (keySource === 'server') {
        toast.success('Using Google Maps from Tethys API', {
          duration: 4000,
          id: 'maps-api-source',
          className: 'blue-toast',
        })
      } else if (keySource === 'local') {
        toast.success('Using Google Maps from local .env', {
          duration: 4000,
          id: 'maps-api-source',
          className: 'blue-toast',
        })
      } else if (keySource === 'none' && !apiKey) {
        // Notify but don't block interface
        toast.error(
          'Google Maps API unavailable - Google Hybrid map and elevation data unavailable‼️ ',
          {
            duration: 6000,
            id: 'maps-api-missing',
          }
        )
      }
    }
  }, [isLoading, keySource, apiKey])

  // Check if Maps API is already available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setIsLoaded(true)
    }
  }, [])

  // Just a minimal loading indicator that doesn't take much space
  if (isLoading) {
    return <div className="opacity-0">Loading maps...</div>
  }

  // On error, just render children without blocking UI
  if (error) {
    console.warn('Maps API key error, using alternative maps:', error.message)
    return <>{children}</>
  }

  // If already loaded, just render children
  if (isLoaded || (typeof window !== 'undefined' && window.google?.maps)) {
    return <>{children}</>
  }

  // If no API key, silently render children
  if (!apiKey) {
    console.warn('No Google Maps API key available, using alternative maps')
    return <>{children}</>
  }

  // Otherwise load scripts and render
  return (
    <LoadScriptNext
      googleMapsApiKey={apiKey}
      loadingElement={<>{children}</>} // Render children while loading
      onLoad={() => {
        console.log('✅ Google Maps script loaded successfully')
        setIsLoaded(true)
      }}
      onError={(err) => {
        console.error('❌ Google Maps loading error:', err)
        // Toast notification but continue with app
        toast.error('Google Hybrid map unavailable', {
          duration: 3000,
          id: 'maps-loading-error',
        })
      }}
    >
      <>{children}</>
    </LoadScriptNext>
  )
}
