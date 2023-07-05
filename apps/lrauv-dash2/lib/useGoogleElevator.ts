import { useCallback, useRef, useMemo } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

export const useGoogleElevator = (googleMapsApiKey: string) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? googleMapsApiKey,
  })

  const elevator = useMemo(
    () => (isLoaded ? new google.maps.ElevationService() : null),
    [isLoaded]
  )

  const depthLoading = useRef(false)
  const lastKnownDepth = useRef<number | null>(null)
  const handleDepthRequest = useCallback(
    async (lat: number, lng: number) => {
      if (depthLoading.current) return lastKnownDepth.current ?? 0
      const r: google.maps.LocationElevationRequest = {
        locations: [
          {
            lat,
            lng,
          },
        ],
      }
      depthLoading.current = true
      const result = await elevator?.getElevationForLocations(r)
      lastKnownDepth.current = result?.results[0].elevation ?? null
      depthLoading.current = false
      return lastKnownDepth.current ?? 0
    },
    [elevator, lastKnownDepth, depthLoading]
  )

  return { handleDepthRequest }
}
