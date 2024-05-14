import { on } from 'events'
import { useMapEvents } from 'react-leaflet'
import { useManagedWaypoints } from 'react-ui/dist'

const ClickableMapPoint: React.FC<{
  onClick?: (lat: number, lng: number) => void
}> = ({ onClick }) => {
  const { focusedWaypointIndex, handleWaypointsUpdate, updatedWaypoints } =
    useManagedWaypoints()
  const map = useMapEvents({
    click(e) {
      if (onClick) {
        onClick?.(e.latlng.lat, e.latlng.lng)
      } else {
        console.log(e.latlng)
        handleWaypointsUpdate(
          updatedWaypoints.map((waypoint, index) => {
            if (index === focusedWaypointIndex) {
              return {
                ...waypoint,
                lat: e.latlng.lat.toString(),
                lon: e.latlng.lng.toString(),
              }
            }
            return waypoint
          })
        )
      }
    },
  })
  return null
}

export default ClickableMapPoint
