import { useCallback, useRef, useMemo } from 'react'

export const useGoogleElevator = () => {
  const isGoogleMapsAvailable = typeof google !== 'undefined' && !!google.maps

  const elevator = useMemo(() => {
    try {
      return isGoogleMapsAvailable ? new google.maps.ElevationService() : null
    } catch (error) {
      console.error('Google Maps API not initialized:', error)
      return null
    }
  }, [isGoogleMapsAvailable])

  const depthLoading = useRef(false)
  const lastKnownDepth = useRef<number | null>(null)

  const handleDepthRequest = useCallback(
    async (lat: number, lng: number) => {
      if (!elevator) {
        console.error('Elevation service is unavailable.')
        return 0
      }

      if (depthLoading.current) return lastKnownDepth.current ?? 0

      try {
        const r: google.maps.LocationElevationRequest = {
          locations: [{ lat, lng }],
        }

        depthLoading.current = true
        const result = await elevator.getElevationForLocations(r)
        lastKnownDepth.current = result?.results?.[0]?.elevation ?? null
      } catch (error) {
        console.error('Error fetching elevation:', error)
      } finally {
        depthLoading.current = false
      }

      return lastKnownDepth.current ?? 0
    },
    [elevator]
  )

  return { handleDepthRequest }
}
