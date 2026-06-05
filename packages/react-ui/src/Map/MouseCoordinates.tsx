// jshint esversion:6
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react'
import { useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useDebouncedEffect } from '@mbari/utils'
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
  onRequestDepth?: (lat: number, lng: number) => Promise<number | null>
}

const MouseCoordinates: React.FC<MouseCoordinatesProps> = ({
  onRequestDepth,
}) => {
  const [mousePoint, setMousePoint] = useState(null as null | L.LatLng)
  const [depth, setDepth] = useState(
    null as null | { depth: number | null; coordinate: string }
  )
  const requestIdRef = useRef(0)

  // useLayoutEffect runs synchronously after DOM mutations but before paint,
  // preventing the one-frame flicker where new coordinates appear alongside
  // the previous depth value. The cleanup bumps the counter on unmount (and
  // before each re-run) so any in-flight onRequestDepth promise becomes stale
  // and cannot call setDepth after the component unmounts.
  useLayoutEffect(() => {
    requestIdRef.current++
    setDepth((prev) => (prev !== null ? null : prev))
    return () => {
      requestIdRef.current++
    }
  }, [mousePoint])

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
    if (mousePoint != null && onRequestDepth) {
      const id = ++requestIdRef.current
      onRequestDepth(mousePoint.lat, mousePoint.lng)
        .then((depth) => {
          if (id === requestIdRef.current) {
            setDepth({ depth, coordinate: formattedCoordinates })
          }
        })
        .catch(() => {
          // Elevation API errors (e.g. MapsServerError UNKNOWN_ERROR) are
          // handled upstream; clear stale depth so the previous coordinate's
          // value is not shown for the new position.
          if (id === requestIdRef.current) {
            setDepth(null)
          }
        })
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
      {typeof depth?.depth === 'number' &&
        ` ${depth.depth.toPrecision(4)}m at `}
      {formattedCoordinates}
    </div>
  )
}

export default MouseCoordinates
