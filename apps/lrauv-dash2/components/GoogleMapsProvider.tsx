import React, { useState, useEffect } from 'react'
import { useGoogleMapsApiKey } from './useGoogleMapsApiKey'
import { LoadScriptNext } from '@react-google-maps/api'
import toast from 'react-hot-toast'

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

// Track if script is already loaded to prevent duplicate loading
let isScriptLoaded = false

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const { apiKey, isLoading, error } = useGoogleMapsApiKey()
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if Maps API is already available in window object
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      console.log('📌 Google Maps already loaded in window object')
      setIsLoaded(true)
    }
  }, [])

  if (isLoading) {
    console.log('📌 Loading Google Maps API Key...')
    return <div>Loading Maps configuration...</div>
  }

  // First check for error
  if (error) {
    console.error('❌ Error loading Google Maps API key:', error)
    toast.error(`Failed to load Google Maps: ${error.message}`)
    return <>{children}</>
  }

  // Then check if already loaded
  if (isLoaded || (typeof window !== 'undefined' && window.google?.maps)) {
    console.log('📌 Using existing Google Maps instance')
    return <>{children}</>
  }

  // Check for missing API key
  if (!apiKey) {
    console.warn('❌ No Google Maps API key available')
    toast.error('Google Maps API key not available')
    return <>{children}</>
  }

  // If we got here, we have a key and need to load the script
  console.log('📌 Loading Google Maps with API key')
  return (
    <LoadScriptNext
      googleMapsApiKey={apiKey}
      loadingElement={<div>Loading Google Maps...</div>}
      onLoad={() => {
        toast.success('Google Maps loaded successfully')
        setIsLoaded(true)
        isScriptLoaded = true
        console.log('📌 Google Maps script loaded successfully')
      }}
      onError={(err) => {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('❌ Google Maps script loading error:', errorMsg)
        toast.error(`Google Maps loading error: ${errorMsg}`)
      }}
    >
      <>{children}</>
    </LoadScriptNext>
  )
}
