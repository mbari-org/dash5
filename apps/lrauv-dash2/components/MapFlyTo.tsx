import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapCamera } from './MapCameraContext'

/** ESRI Oceans native max is 13 (`ESRI_MAX_NATIVE_ZOOM` on Map). */
const FLY_TO_ZOOM = 13

type MutantLayer = {
  _update?: (center?: unknown) => void
  _mutant?: unknown
}

/** Sync the hidden Google map only. Do not GridLayer.redraw() — hybrid Mutant
 *  prunes tiles on redraw/zoom and leaves gray holes in the viewport. */
const syncGoogleMutant = (map: ReturnType<typeof useMap>) => {
  map.invalidateSize()
  map.eachLayer((layer) => {
    const grid = layer as MutantLayer
    if (!grid._mutant) return
    if (window.google?.maps?.event) {
      window.google.maps.event.trigger(grid._mutant, 'resize')
      window.google.maps.event.addListenerOnce(grid._mutant, 'idle', () => {
        grid._update?.()
      })
    }
    grid._update?.()
  })
}

const MapFlyTo: React.FC = () => {
  const map = useMap()
  const { flyToRequest, setFlyToRequest } = useMapCamera()

  useEffect(() => {
    if (!flyToRequest) return

    if (flyToRequest.bounds) {
      map.fitBounds(flyToRequest.bounds, {
        padding: [40, 40],
        animate: true,
      })
    } else {
      // Animated flyTo fires zoomanim, which GoogleMutant uses to copy tiles.
      // Instant setView skips that and leaves a hole in the viewport.
      map.flyTo([flyToRequest.lat, flyToRequest.lon], FLY_TO_ZOOM, {
        duration: 0.45,
      })
    }

    syncGoogleMutant(map)
    map.once('moveend', () => syncGoogleMutant(map))
    setFlyToRequest(null)
  }, [flyToRequest, map, setFlyToRequest])

  return null
}

export default MapFlyTo
