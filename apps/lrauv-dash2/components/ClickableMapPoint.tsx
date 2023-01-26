import { useMapEvents } from 'react-leaflet'
import { useManagedWaypoints } from 'react-ui/dist'

const ClickableMapPoint = () => {
  const { focusedWaypointIndex, handleWaypointsUpdate, updatedWaypoints } =
    useManagedWaypoints()
  const map = useMapEvents({
    click(e) {
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
    },
  })
  return null
}

export default ClickableMapPoint
