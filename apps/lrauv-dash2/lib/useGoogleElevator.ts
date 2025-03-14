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
