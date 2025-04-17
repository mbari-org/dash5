import React from 'react'
import { useGoogleMapsApiKey } from './useGoogleMapsApiKey'
import { LoadScript } from '@react-google-maps/api'

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
}) => {
  const { apiKey, isLoading, error } = useGoogleMapsApiKey()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading map configuration...
      </div>
    )
  }

  if (error && !apiKey) {
    // Show the error message in the UI
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-red-500">
        <p>Error loading Google Maps:</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center">
        Unable to load Google Maps API key
      </div>
    )
  }

  return <LoadScript googleMapsApiKey={apiKey}>{children}</LoadScript>
}
