// @ts-nocheck
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

const divStyle = {
  color: 'darkblue',
  borderStyle: 'solid',
  // borderWidth: 'medium',
  borderColor: 'black',
  width: 'auto',
  margin: 'auto',
  border: '1px solid rgba(0,0,0,0.2)',
  borderRadius: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  outline: '1px',
  fontSize: '12px',
  fontFamily: 'courier, monospace',
  boxShadow: 'none',
  // color: '#333',
  padding: '0.5px 0.5px',
  minHeight: '14px',
  cursor: 'pointer',
}

export type MouseCoordinatesProps = Control.MouseCoordinatesOptions

function round(number, precision = 0) {
  return (
    Math.round(number * Math.pow(10, precision) + Number.EPSILON) /
    Math.pow(10, precision)
  )
}

function formatLatitude(latitude) {
  const direction = latitude > 0 ? 'N' : 'S'
  return `${round(Math.abs(latitude), 4)}° ${direction}`
}

function formatLongitude(longitude) {
  const direction = longitude > 0 ? 'E' : 'W'
  return `${round(Math.abs(longitude), 4)}° ${direction}`
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
      setMousePoint(null)
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
