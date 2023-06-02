// jshint esversion:6
import React from 'react'
import { useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { createControlComponent } from '@react-leaflet/core'
import { Control } from 'leaflet'
import L from 'leaflet'

// Classes used by Leaflet to position controls
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

const BOUNDS_STYLE = { weight: 1 }

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

export type MouseCoordinatesProps = Control.MouseCoordinatesOptions

function formatLatitude(latitude) {
  latitude = `${latitude.toFixed(5)}`
  return `${latitude}`
}

function formatLongitude(longitude) {
  longitude = `${longitude.toFixed(5)}`
  return `${longitude}`
}

function MouseCoordinates(props) {
  const [mousePoint, setMousePoint] = React.useState(null)

  const formattedCoordinates =
    mousePoint === null
      ? ''
      : `${formatLatitude(mousePoint.lat)}, ${formatLongitude(mousePoint.lng)}`

  React.useEffect(
    function copyToClipboard() {
      function handleCtrlCKeydown(event) {
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
    mouseout() {
      // setMousePoint(null)
    },
  })

  if (formattedCoordinates.length === 0) return null

  return (
    <div
      className="leaflet-control leaflet-bar"
      style={divStyle}
      pathOptions={BOUNDS_STYLE}
    >
      {formattedCoordinates}
    </div>
  )
}

// export type MouseCoordinatesCtlProps = Control.MouseCoordinatesCtlOptions

// export const MouseCoordinatesCtl = createControlComponent
//     <
//     Control.MouseCoordinatesCtl,
//     MouseCoordinatesCtlProps
//     >
//    (function createMouseCoordinatesCtl(props) {
//        return new Control.MouseCoordinatesCtl(props)
//    })

export default MouseCoordinates
