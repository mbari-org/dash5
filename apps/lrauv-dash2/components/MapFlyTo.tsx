import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapCamera } from './MapCameraContext'

const MapFlyTo: React.FC = () => {
  const map = useMap()
  const { flyToRequest, setFlyToRequest } = useMapCamera()

  useEffect(() => {
    if (flyToRequest) {
      map.flyTo(
        [flyToRequest.lat, flyToRequest.lon],
        Math.max(map.getZoom(), 13)
      )
      setFlyToRequest(null)
    }
  }, [flyToRequest, map, setFlyToRequest])

  return null
}

export default MapFlyTo
