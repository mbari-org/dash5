import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useSelectedStations } from './SelectedStationContext'

const MapFlyTo: React.FC = () => {
  const map = useMap()
  const { flyToRequest, setFlyToRequest } = useSelectedStations()

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
