import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSelectedStations } from './SelectedStationContext'

const MapFlyTo: React.FC = () => {
  const map = useMap()
  const { flyToRequest, setFlyToRequest } = useSelectedStations()

  useEffect(() => {
    if (flyToRequest) {
      if (flyToRequest.geoJson) {
        try {
          const bounds = L.geoJSON(
            flyToRequest.geoJson as GeoJSON.GeoJsonObject
          ).getBounds()
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [40, 40] })
          }
        } catch {
          // fall back to center point if bounds can't be computed
          map.flyTo(
            [flyToRequest.lat, flyToRequest.lon],
            Math.max(map.getZoom(), 13)
          )
        }
      } else {
        map.flyTo(
          [flyToRequest.lat, flyToRequest.lon],
          Math.max(map.getZoom(), 13)
        )
      }
      setFlyToRequest(null)
    }
  }, [flyToRequest, map, setFlyToRequest])

  return null
}

export default MapFlyTo
