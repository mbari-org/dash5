import { useEffect } from 'react'

/**
 * Ends the in-progress add/edit session on logout and when the map view
 * unmounts.
 *
 * This does not remove markers. Markers live in MarkerProvider (app-wide), so
 * they remain visible when switching Overview and vehicle maps. The session
 * reset covers add-marker mode, the active-edit id, and the isNew flag so a
 * half-finished new-marker popup cannot reopen on the next map or block
 * adding another pin ("Please finish editing current marker first").
 */
export const useClearMarkerEditModeWhenLoggedOut = (params: {
  canEditMarkers: boolean
  clearMarkerEditSession: () => void
}) => {
  const { canEditMarkers, clearMarkerEditSession } = params

  useEffect(() => {
    if (!canEditMarkers) {
      clearMarkerEditSession()
    }
  }, [canEditMarkers, clearMarkerEditSession])

  useEffect(() => {
    return () => {
      clearMarkerEditSession()
    }
  }, [clearMarkerEditSession])
}
