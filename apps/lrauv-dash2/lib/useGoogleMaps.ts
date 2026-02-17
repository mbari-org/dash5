import { useTethysApiContext } from '@mbari/api-client'
import { useState, useEffect } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

export const useGoogleMaps = () => {
  const { siteConfig } = useTethysApiContext()
  const googleMapsApiKey = siteConfig?.appConfig.googleApiKey

  const [mapsLoaded, setMapsLoaded] = useState(false)
  useEffect(() => {
    if (typeof google !== 'undefined' && !mapsLoaded) {
      setMapsLoaded(true)
    }
    if (!googleMapsApiKey || mapsLoaded || typeof google !== 'undefined') return
    new Loader({
      apiKey: googleMapsApiKey,
      version: 'weekly',
      libraries: ['elevation'],
    })
      .importLibrary('elevation')
      .then(() => {
        setMapsLoaded(true)
      })
      .catch((e) => {
        console.warn('Error loading Google Maps API', e)
      })
  }, [googleMapsApiKey, mapsLoaded, setMapsLoaded])

  return { mapsLoaded }
}
