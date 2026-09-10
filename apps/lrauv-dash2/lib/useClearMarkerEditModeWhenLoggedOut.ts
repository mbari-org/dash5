import { useEffect } from 'react'

/**
 * Clears add/edit marker mode on logout and when the map view unmounts.
 * MarkerProvider is app-wide, so edit state must not persist across routes.
 */
export const useClearMarkerEditModeWhenLoggedOut = (params: {
  canEditMarkers: boolean
  isAddingMarkers: boolean
  activeEditMarkerId: string | null
  setIsAddingMarkers: (value: boolean) => void
  setActiveEditMarkerId: (id: string | null) => void
}) => {
  const {
    canEditMarkers,
    isAddingMarkers,
    activeEditMarkerId,
    setIsAddingMarkers,
    setActiveEditMarkerId,
  } = params

  useEffect(() => {
    if (!canEditMarkers) {
      if (isAddingMarkers) setIsAddingMarkers(false)
      if (activeEditMarkerId) setActiveEditMarkerId(null)
    }
  }, [
    canEditMarkers,
    isAddingMarkers,
    activeEditMarkerId,
    setIsAddingMarkers,
    setActiveEditMarkerId,
  ])

  useEffect(() => {
    return () => {
      setIsAddingMarkers(false)
      setActiveEditMarkerId(null)
    }
  }, [setIsAddingMarkers, setActiveEditMarkerId])
}
