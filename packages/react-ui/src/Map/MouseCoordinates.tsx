// jshint esversion:6
import React, { useState, useEffect, useCallback } from 'react'
import { useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useDebouncedEffect } from '@mbari/utils'
import { toast } from 'react-hot-toast'

const divStyle = {
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

const formatCoordinate = (latitude: number) => {
  return `${latitude.toFixed(5)}`
}

export interface MouseCoordinatesProps {
  onRequestDepth?: (lat: number, lng: number) => Promise<number>
}

const MouseCoordinates: React.FC<MouseCoordinatesProps> = ({
  onRequestDepth,
}) => {
  const [mousePoint, setMousePoint] = useState(null as null | L.LatLng)
  const [depth, setDepth] = useState(
    null as null | { depth: number; coordinate: string }
  )

  const formattedCoordinates =
    mousePoint === null
      ? ''
      : `${formatCoordinate(mousePoint.lat)}, ${formatCoordinate(
          mousePoint.lng
        )}`

  const handleDepth = useCallback(() => {
    // if (window.location.hostname.match(/localhost/i)) {
    //   toast(
    //     `Developer debug generating example depth for ${formattedCoordinates}`,
    //     { icon: '⚠️', position: 'bottom-right' }
    //   )
    //   setDepth({ depth: Math.random() * 100, coordinate: formattedCoordinates })
    //   return
    // }
    if (mousePoint?.lat && mousePoint.lng) {
      onRequestDepth?.(mousePoint?.lat, mousePoint?.lng).then((depth) =>
        setDepth({ depth, coordinate: formattedCoordinates })
      )
    }
  }, [mousePoint, onRequestDepth, formattedCoordinates])

  useDebouncedEffect(handleDepth, 1000, [setDepth, onRequestDepth, mousePoint])

  useEffect(
    function copyToClipboard() {
      function handleCtrlCKeydown(event: KeyboardEvent) {
        if (
          event.key === 'c' &&
          event.ctrlKey &&
          formattedCoordinates.length > 0 &&
          navigator.clipboard
        ) {
          navigator.clipboard?.writeText(formattedCoordinates)
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
      {depth?.depth && ` ${depth.depth.toPrecision(4)}m at `}
      {formattedCoordinates}
    </div>
  )
}

export default MouseCoordinates
