import React from 'react'
import { useMapEvents } from 'react-leaflet'
import { useManagedWaypoints } from 'react-ui/dist'
import { createLogger } from '@mbari/utils'

const logger = createLogger('ClickableMapPoint')
const ClickableMapPoint: React.FC<{
  onClick?: (lat: number, lng: number) => void
}> = ({ onClick }) => {
  const { focusedWaypointIndex, setWaypointCustomPosition } =
    useManagedWaypoints()
  const map = useMapEvents({
    click(e) {
      if (onClick) {
        onClick?.(e.latlng.lat, e.latlng.lng)
      } else {
        logger.debug(`Lat: ${e.latlng.lat}, Lng: ${e.latlng.lng}`)
        if (focusedWaypointIndex == null) return

        setWaypointCustomPosition(focusedWaypointIndex, {
          lat: e.latlng.lat,
          lon: e.latlng.lng,
        })
      }
    },
  })
  return null
}

export default ClickableMapPoint
