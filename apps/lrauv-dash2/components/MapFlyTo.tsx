import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapCamera } from './MapCameraContext'

const MapFlyTo: React.FC = () => {
  const map = useMap()
  const { flyToRequest, setFlyToRequest } = useMapCamera()

  useEffect(() => {
    if (flyToRequest) {
      if (flyToRequest.bounds) {
        map.fitBounds(flyToRequest.bounds, {
          padding: [20, 20],
          maxZoom: 13,
          animate: false,
        })
      } else {
        map.setView(
          [flyToRequest.lat, flyToRequest.lon],
          Math.max(map.getZoom(), 13),
          { animate: false }
        )
      }
      setFlyToRequest(null)
    }
  }, [flyToRequest, map, setFlyToRequest])

  return null
}

export default MapFlyTo
