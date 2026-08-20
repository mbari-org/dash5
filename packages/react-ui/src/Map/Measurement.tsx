import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Circle,
  CircleMarker,
  Marker,
  Popup,
  Polygon,
  useMap,
  Polyline,
  Tooltip,
} from 'react-leaflet'
import L from 'leaflet'
import { point, distance, polygon, area } from '@turf/turf'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsToCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import {
  classifyMeasurement,
  isNearFirstVertex,
  SymbolFeature,
} from './Measurement.utils'

const color = '#00ff00'
const regex = /\B(?=(\d{3})+(?!\d))/g

let perimeter: number = 0
let totalDistance: number
let surfaceArea: number = 0
let ptCoord: L.LatLng
let mapC: string = ''
let dmsC: string = ''

// DEFINE STYLE CONSTANTS
const measStyle = {
  color: '#00008b',
  fontFamily: 'Helvetica Neue, Arial, Helvetica, sans-serif',
  fontSize: '12px/1.5',
}
const measStyleLink = {
  color: 'blue',
  '&:hover': {
    color: '#999',
  },
  fontFamily: 'Helvetica Neue, Arial, Helvetica, sans-serif',
  fontSize: '13px!important',
}

// Function to convert coordinate in deg to DMS
function ConvertDEGToDMS(deg: number, dir: boolean) {
  var absolute = Math.abs(deg)
  var degrees = Math.floor(absolute)
  var minutesNotTruncated = (absolute - degrees) * 60
  var minutes = Math.floor(minutesNotTruncated)
  var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2)
  if (dir) {
    var direction = deg >= 0 ? 'N' : 'S'
  } else {
    var direction = deg >= 0 ? 'E' : 'W'
  }
  return degrees + '° ' + minutes + "' " + seconds + '" ' + direction
}

// DEFINE DERIVED CONST
// CalculateDistance (Path Perimeter)
// When closed=true the last→first segment is included, giving the full
// perimeter for polygon (area) measurements.
const calculateDistance = (positions: L.LatLng[], closed = false): number => {
  // Reset perimeter so stale values are never shown when positions is empty.
  perimeter = 0
  totalDistance = 0
  for (let i = 0; i < positions.length - 1; i++) {
    const from = point([positions[i].lng, positions[i].lat])
    const to = point([positions[i + 1].lng, positions[i + 1].lat])
    totalDistance += distance(from, to)
    perimeter = totalDistance
  }
  if (closed && positions.length >= 3) {
    const last = positions[positions.length - 1]
    const first = positions[0]
    totalDistance += distance(
      point([last.lng, last.lat]),
      point([first.lng, first.lat])
    )
    perimeter = totalDistance
  }
  return totalDistance
}

// calculateSurfaceArea (set meas based on coordinates.length)
const calculateSurfaceArea = (positions: L.LatLng[]): number => {
  const coordinates = positions.map((p) => [p.lng, p.lat])
  coordinates.push(coordinates[0]) // Close the polygon
  if (!coordinates.length) return 0
  if (coordinates.length === 1) {
    return 0
  } else if (coordinates.length < 4) {
    return 0
  } else {
    const shape = polygon([coordinates])
    surfaceArea = area(shape)
    return surfaceArea
  }
}

export const PathComponent = () => {
  let pMeters = (perimeter * 1000).toFixed(2)
  pMeters = pMeters.toString().replace(regex, ',')
  let pKMeters = perimeter.toFixed(2)
  pKMeters = pKMeters.toString().replace(regex, ',')
  return (
    <div>
      {pMeters} Meters / ({pKMeters} Kilometers)
      <br />
    </div>
  )
}
export const AreaComponent = () => {
  let sfcAM2 = surfaceArea.toFixed(2)
  sfcAM2 = sfcAM2.toString().replace(regex, ',')
  let sfcKm2 = (surfaceArea / 1_000_000).toFixed(2)
  sfcKm2 = sfcKm2.toString().replace(regex, ',')
  return (
    <div>
      {sfcAM2} Sq. Meters
      <br />({sfcKm2} Sq. Km)
      <br />
    </div>
  )
}

export type { SymbolFeature } from './Measurement.utils'
export {
  classifyMeasurement,
  CLOSE_RADIUS_PX,
  isNearFirstVertex,
  isWithinCloseRadius,
} from './Measurement.utils'

const makeCaptureIcon = (map: L.Map) => {
  const size = map.getSize()
  const w = Math.max(size.x * 2, 1)
  const h = Math.max(size.y * 2, 1)
  return L.divIcon({
    className: 'measurement-capture-icon',
    iconSize: [w, h],
    iconAnchor: [size.x, size.y],
    html: '<div style="width:100%;height:100%"></div>',
  })
}

const VERTEX_RADIUS_PX = 3
const CLOSE_VERTEX_RADIUS_PX = 5
const CLOSE_VERTEX_HOVER_RADIUS_PX = 7

// Invisible overlay matching leaflet-measure: clicks hit this marker, not the map.
const CaptureMarker: React.FC<{
  onClick: (latlng: L.LatLng) => void
  closeTarget: L.LatLng | null
  onHoverClose: (hovering: boolean) => void
}> = ({ onClick, closeTarget, onHoverClose }) => {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)
  const closeTargetRef = useRef(closeTarget)
  const onHoverCloseRef = useRef(onHoverClose)
  const hoveringRef = useRef(false)
  const [center, setCenter] = useState(() => map.getCenter())
  const [icon, setIcon] = useState(() => makeCaptureIcon(map))

  useEffect(() => {
    closeTargetRef.current = closeTarget
  }, [closeTarget])
  useEffect(() => {
    onHoverCloseRef.current = onHoverClose
  }, [onHoverClose])

  const setHovering = (hovering: boolean) => {
    if (hoveringRef.current === hovering) return
    hoveringRef.current = hovering
    const el = markerRef.current?.getElement()
    el?.classList.toggle('measurement-capture-over-close', hovering)
    onHoverCloseRef.current(hovering)
  }

  useEffect(() => {
    if (!closeTarget) setHovering(false)
  }, [closeTarget])

  useEffect(() => {
    const reposition = () => {
      setCenter(map.getCenter())
      setIcon(makeCaptureIcon(map))
    }
    map.on('move', reposition)
    map.on('resize', reposition)
    return () => {
      map.off('move', reposition)
      map.off('resize', reposition)
    }
  }, [map])

  useEffect(() => {
    const el = markerRef.current?.getElement()
    el?.classList.toggle('measurement-capture-over-close', hoveringRef.current)
  }, [icon])

  const latlngFromEvent = (e: L.LeafletMouseEvent): L.LatLng | null => {
    const orig = e.originalEvent
    if (!orig) return null
    // Mouse / pointer events carry clientX directly.
    if ('clientX' in orig) return map.mouseEventToLatLng(orig as MouseEvent)
    // Touch events carry coordinates on touches[0] / changedTouches[0].
    if ('touches' in orig) {
      const touch =
        (orig as TouchEvent).touches[0] ??
        (orig as TouchEvent).changedTouches[0]
      if (!touch) return null
      return map.mouseEventToLatLng(touch as unknown as MouseEvent)
    }
    return null
  }

  return (
    <Marker
      ref={markerRef}
      position={center}
      icon={icon}
      opacity={0}
      zIndexOffset={10000}
      interactive
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stop(e)
          const latlng = latlngFromEvent(e)
          if (latlng) onClick(latlng)
        },
        mousemove: (e) => {
          const target = closeTargetRef.current
          const latlng = latlngFromEvent(e)
          if (!target || !latlng) {
            setHovering(false)
            return
          }
          setHovering(isNearFirstVertex(latlng, target, map))
        },
        mouseout: () => setHovering(false),
      }}
    />
  )
}

// MeasurementProps to be exported as interface
export interface MeasurementProps {
  key?: string
  editing?: boolean
  showPopup?: boolean
  onDelete?: () => void
  onClose?: () => void
  onVertexAdded?: (lat: number, lng: number) => void
}

////////////////////////////////////////////////////////
// Measurement values to be exported
////////////////////////////////////////////////////////
export const Measurement: React.FC<MeasurementProps> = ({
  editing,
  showPopup = false,
  onDelete: handleDelete,
  onClose: handleClose,
  onVertexAdded: handleVertexAdded,
}) => {
  const map = useMap()
  const circleRef = useRef<L.Circle | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const polygonRef = useRef<L.Polygon | null>(null)

  const [measurements, setMeasurements] = useState([] as L.LatLng[])
  const [isClosed, setIsClosed] = useState(false)
  const [featureKind, setFeatureKind] = useState<SymbolFeature | ''>('')
  const [closeTargetHovered, setCloseTargetHovered] = useState(false)

  const measurementsRef = useRef(measurements)
  const isClosedRef = useRef(isClosed)
  const handleCloseRef = useRef(handleClose)
  const handleVertexAddedRef = useRef(handleVertexAdded)
  useEffect(() => {
    measurementsRef.current = measurements
  }, [measurements])
  useEffect(() => {
    isClosedRef.current = isClosed
  }, [isClosed])
  useEffect(() => {
    handleCloseRef.current = handleClose
  }, [handleClose])
  useEffect(() => {
    handleVertexAddedRef.current = handleVertexAdded
  }, [handleVertexAdded])

  useEffect(() => {
    if (showPopup && !editing && measurements.length > 0 && featureKind) {
      const timer = setTimeout(() => {
        if (featureKind === 'point' && circleRef.current) {
          circleRef.current.openPopup()
        } else if (featureKind === 'line' && polylineRef.current) {
          polylineRef.current.openPopup()
        } else if (featureKind === 'area' && polygonRef.current) {
          polygonRef.current.openPopup()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [showPopup, editing, measurements, featureKind])

  const wasEditing = useRef(editing)

  useEffect(() => {
    if (!editing && wasEditing.current) {
      setFeatureKind(
        classifyMeasurement(measurementsRef.current.length, isClosedRef.current)
      )
    }
    wasEditing.current = editing
  }, [editing])

  useEffect(() => {
    if (editing && !isClosed) {
      map.dragging.disable()
      return () => {
        map.dragging.enable()
      }
    }
    return undefined
  }, [editing, isClosed, map])

  const handleCenterClick = () => {
    map.fitBounds(
      measurements.map((fb) => [fb.lat, fb.lng]) as [number, number][]
    )
  }

  const handlePointEvents = (e: L.LatLng) => {
    let dir = true
    mapC = e.lat.toFixed(6) + '  /  ' + e.lng.toFixed(6)
    const dmsLat = ConvertDEGToDMS(e.lat, dir)
    dir = false
    const dmsLng = ConvertDEGToDMS(e.lng, dir)
    dmsC = dmsLat + ' / ' + dmsLng
  }

  const handleCaptureClick = useCallback(
    (latlng: L.LatLng) => {
      if (!editing || isClosedRef.current) return
      const prev = measurementsRef.current
      if (prev.length >= 3 && isNearFirstVertex(latlng, prev[0], map)) {
        isClosedRef.current = true
        calculateDistance(prev, true)
        calculateSurfaceArea(prev)
        setIsClosed(true)
        setCloseTargetHovered(false)
        handleCloseRef.current?.()
        return
      }
      if (prev.length > 0 && prev[prev.length - 1].equals(latlng)) return
      handlePointEvents(latlng)
      const next = [...prev, latlng]
      calculateDistance(next, false)
      // Keep surfaceArea current so AreaComponent in Map.tsx reads the right
      // value on this render cycle (parent renders before child useMemo runs).
      if (next.length >= 3) {
        calculateSurfaceArea(next)
      } else {
        surfaceArea = 0
      }
      setMeasurements(next)
      handleVertexAddedRef.current?.(latlng.lat, latlng.lng)
    },
    [editing, map]
  )

  const pathDist: number = useMemo(
    () => calculateDistance(measurements, isClosed),
    [measurements, isClosed]
  )
  const sfcArea: number = useMemo(
    () => (measurements.length >= 3 ? calculateSurfaceArea(measurements) : 0),
    [measurements]
  )

  let m = (pathDist * 1000).toFixed(2)
  let km = pathDist.toFixed(2)
  let m2 = sfcArea.toFixed(2)
  let km2 = (sfcArea / 1_000_000).toFixed(2)

  // Show polygon fill preview while editing as soon as 3+ points exist (Dash4 parity).
  // Once finished, only keep the Polygon layer when the shape was explicitly closed
  // as an area — open paths finished as lines shed the fill.
  const showPolygon = editing
    ? measurements.length >= 3
    : featureKind === 'area'
  const showPoint = featureKind === 'point' && measurements.length === 1
  // Keep the polyline visible for placed-edge borders even when polygon fill is shown.
  const showLine = !isClosed && measurements.length >= 2
  const canClose = Boolean(editing && !isClosed && measurements.length >= 3)

  const ClickOptions = () => (
    <li>
      {handleCenterClick ? (
        <a
          style={measStyleLink}
          onClick={handleCenterClick}
          className="hover:text-blue-200"
        >
          <FontAwesomeIcon icon={faArrowsToCircle} /> Center on this{' '}
          {featureKind}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </a>
      ) : null}
      {handleDelete ? (
        <a
          style={measStyleLink}
          onClick={handleDelete}
          className="hover:text-blue-200"
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete
        </a>
      ) : null}
    </li>
  )

  return (
    <>
      {editing && !isClosed ? (
        <CaptureMarker
          onClick={handleCaptureClick}
          closeTarget={canClose ? measurements[0] : null}
          onHoverClose={setCloseTargetHovered}
        />
      ) : null}

      {showPoint ? (
        <Circle
          ref={circleRef}
          center={measurements[0]}
          radius={25}
          color={color}
        >
          <Popup>
            <ul className="flex flex-col">
              <>
                <h6>
                  <span
                    className="width=100% text-align=center font-bold text-blue-800"
                    justify-content="center"
                  >
                    Point Location
                  </span>
                </h6>
                <br />
                <hr />
                <br />
                <li>
                  Point Coordinate:
                  <br />
                  <span style={measStyle}>
                    {dmsC}
                    <br />
                    {mapC}
                    <br />
                  </span>
                  <br />
                  <hr></hr>
                  <br />
                </li>
              </>
              <ClickOptions />
            </ul>
          </Popup>
        </Circle>
      ) : null}

      {showLine ? (
        <Polyline ref={polylineRef} positions={measurements} color={color}>
          <Popup>
            <ul className="flex flex-col">
              <>
                <h6>
                  <span
                    className="width=100% text-align=center font-bold text-blue-800"
                    justify-content="center"
                  >
                    Linear Measurement
                  </span>
                </h6>
                <br />
                <hr />
                <br />
                <li>
                  Path Distance:
                  <br />
                  <span style={measStyle}>
                    {m.toString().replace(regex, ',')} Meters ({km} Kilometers)
                  </span>
                  <br />
                  <hr></hr>
                  <br />
                </li>
              </>
              <ClickOptions />
            </ul>
          </Popup>
        </Polyline>
      ) : null}

      {showPolygon && measurements.length >= 3 ? (
        <Polygon
          key={`polygon-${isClosed}`}
          ref={polygonRef}
          positions={measurements}
          color={color}
          fillColor={color}
          fillOpacity={0.15}
          stroke={isClosed}
          weight={2}
        >
          <Popup>
            <ul className="flex flex-col">
              <>
                <h6>
                  <span
                    className="width=100% text-align=center font-bold text-blue-800"
                    justify-content="center"
                  >
                    Area Measurement
                  </span>
                </h6>
                <br />
                <hr />
                <br />
                <li>
                  <span className="text-gray-600">Perimeter Distance:</span>
                  <br />
                  <span style={measStyle}>
                    {m.toString().replace(regex, ',')} Meters ({km} Kilometers)
                  </span>
                  <br />
                  <hr></hr>
                  <br />
                </li>
                <li>
                  <span className="text-gray-600">Area:</span>
                  <br />
                  <span style={measStyle}>
                    {m2.toString().replace(regex, ',')} Sq. Meters
                    <br />({km2.toString().replace(regex, ',')} Sq. Km)
                  </span>
                  <br />
                  <hr></hr>
                  <br />
                </li>
              </>
              <ClickOptions />
            </ul>
          </Popup>
        </Polygon>
      ) : null}

      {measurements.map((vertex, i) => {
        const isFirstClosable = canClose && i === 0
        return (
          <CircleMarker
            key={`${vertex.lat}-${vertex.lng}-${i}`}
            center={vertex}
            interactive={false}
            radius={
              isFirstClosable
                ? closeTargetHovered
                  ? CLOSE_VERTEX_HOVER_RADIUS_PX
                  : CLOSE_VERTEX_RADIUS_PX
                : VERTEX_RADIUS_PX
            }
            pathOptions={{
              fillColor: isFirstClosable ? '#f97316' : color,
              fillOpacity: isFirstClosable ? 1 : 0.85,
              color: isFirstClosable ? '#7c2d12' : color,
              weight: isFirstClosable ? 2 : 1,
            }}
          >
            {isFirstClosable ? (
              <Tooltip permanent direction="top">
                Click to close polygon
              </Tooltip>
            ) : null}
          </CircleMarker>
        )
      })}
    </>
  )
}
