import { useEffect } from 'react'

/** Clears add/edit marker mode when the user can no longer edit (e.g. logout). */
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
}
