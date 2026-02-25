import { useState, useEffect } from 'react'

/**
 * Simple "is Google Maps available" hook. Does not load or inject Google;
 * the provider/initializer is the only loader.
 */
export const useGoogleMaps = () => {
  const [mapsLoaded, setMapsLoaded] = useState(
    typeof window !== 'undefined' && !!window.google?.maps
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.google?.maps) {
      setMapsLoaded(true)
      return
    }

    const id = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(id)
        setMapsLoaded(true)
      }
    }, 200)

    return () => clearInterval(id)
  }, [])

  return { mapsLoaded }
}
