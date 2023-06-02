// jshint esversion:6
import React from 'react'
import { useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

let divStyle = {
  color: 'darkblue',
  fontFamily: 'monospace, serif',
  fontSize: 'small',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  padding: '0 4px 0 4p',
  border: '1px solid lightgray',
  borderRadius: '4px',
  boxShadow:
    '0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
  cursor: 'pointer',
}
function formatCoordinate(latitude: number) {
  return `${latitude.toFixed(5)}`
}

const MouseCoordinates: React.FC = () => {
  const [mousePoint, setMousePoint] = React.useState(null as null | L.LatLng)

  const formattedCoordinates =
    mousePoint === null
      ? ''
      : `${formatCoordinate(mousePoint.lat)}, ${formatCoordinate(
          mousePoint.lng
        )}`

  React.useEffect(
    function copyToClipboard() {
      function handleCtrlCKeydown(event: KeyboardEvent) {
        if (
          event.key === 'c' &&
          event.ctrlKey &&
          formattedCoordinates.length > 0 &&
          navigator.clipboard
        ) {
          navigator.clipboard.writeText(formattedCoordinates)
        }
      }

      document.addEventListener('keydown', handleCtrlCKeydown)

      return function cleanup() {
        document.removeEventListener('keydown', handleCtrlCKeydown)
      }
    },
    [formattedCoordinates]
  )

  useMapEvents({
    mousemove(event) {
      setMousePoint(event.latlng)
    },
  })

  if (formattedCoordinates.length === 0) return null

  return (
    <div className="leaflet-control leaflet-bar" style={divStyle}>
      {formattedCoordinates}
    </div>
  )
}

export default MouseCoordinates
