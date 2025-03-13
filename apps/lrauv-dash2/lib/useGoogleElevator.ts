import { useCallback, useRef, useMemo } from 'react'

export const useGoogleElevator = () => {
  const elevator = useMemo(() => {
    if (
      typeof google !== 'undefined' &&
      google.maps &&
      google.maps.ElevationService
    ) {
      return new google.maps.ElevationService()
    }
    return null
  }, [])

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
