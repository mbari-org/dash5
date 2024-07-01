import { useState, useMemo, useEffect, useRef, SetStateAction } from 'react'
import {
  Circle,
  useMapEvents,
  Popup,
  Polygon,
  useMap,
  Polyline,
} from 'react-leaflet'
import L, { LatLng, LatLngExpression, latLng } from 'leaflet'
import { point, distance, polygon, area } from '@turf/turf'
import '../css/Measurement.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsToCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

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
const calculateDistance = (positions: L.LatLng[]): number => {
  totalDistance = 0
  for (let i = 0; i < positions.length - 1; i++) {
    const from = point([positions[i].lng, positions[i].lat])
    const to = point([positions[i + 1].lng, positions[i + 1].lat])
    totalDistance += distance(from, to)
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
  let pMeters = (perimeter * 1000).toFixed(0)
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
  let sfcAM2 = surfaceArea.toFixed(0)
  sfcAM2 = sfcAM2.toString().replace(regex, ',')
  return (
    <div>
      {sfcAM2} Sq. Meters <br />
    </div>
  )
}

export type SymbolFeature = 'point' | 'line' | 'area'

// MeasurementProps to be exported as interface
export interface MeasurementProps {
  key?: string
  editing?: boolean
  onDelete?: () => void
}

////////////////////////////////////////////////////////
// Measurement values to be exported
////////////////////////////////////////////////////////
export const Measurement: React.FC<MeasurementProps> = ({
  editing,
  onDelete: handleDelete,
}) => {
  const map = useMap()
  const feature = useRef('')
  const isLine = useRef(false)
  const isPoint = useRef(false)
  const polygonRef = useRef(null)
  const clickCounter = useRef(0)
  // Construct measurements into an array
  const [measurements, setMeasurements] = useState([] as L.LatLng[])
  // Construct point measurement and the popup for the point measurement
  const [pointCoords, setPointCoords] = useState([] as L.LatLngExpression[])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  // Construct a Click Counter
  const [counter, setCounter] = useState(1)
  let countArray: string | SetStateAction<number> = 0

  // Remove the last measurement when editing is toggled to false as the useMapEvent handler
  // will fire when the user clicks the done button on the map control.
  const wasEditing = useRef(editing)

  // Finished Measuring
  useEffect(() => {
    if (!editing && wasEditing.current) {
      const finalMeasurements = [...measurements]
      setMeasurements(finalMeasurements)
      countArray == 0
      finalMeasurements.pop()
    }
    wasEditing.current = editing
  }, [countArray, editing, map, measurements, setMeasurements])

  const handleCenterClick = () => {
    map.fitBounds(
      measurements.map((fb) => [fb.lat, fb.lng]) as [number, number][]
    )
  }

  // Measuring
  useMapEvents({
    mouseup(event) {
      if (!editing) return
      console.log('Measurements length: ' + measurements.length)
      countArray = measurements.length
      console.log('Count Array: ' + countArray)
      setCounter((prevCount) => prevCount + 1)
      console.log('Counter: ' + counter)
      // setPointCoords(event.latlng)
      setMeasurements([...measurements, event.latlng])
      console.log('setMeasurements: ' + [...measurements])

      clickCounter.current = countArray
      // Determine if linear or Area Measurement - account for initial click
      // Must account for last "click" not being real.....
      if (clickCounter.current === 1) {
        isPoint.current = true
        isLine.current = false
        feature.current = 'point'
        console.log('Point')
        // handlePointEvents(event.latlng)
      } else if (clickCounter.current === 2) {
        isLine.current = true
        isPoint.current = false
        feature.current = 'line'
        console.log('Line')
      } else if (clickCounter.current >= 3) {
        isLine.current = false
        isPoint.current = false
        feature.current = 'area'
        console.log('Area')
      }

      if (measurements.length === 0) {
        console.log('0')
      } else if (measurements.length === 1) {
        console.log('1')
      } else if (measurements.length === 2) {
        console.log('2')
      } else if (measurements.length >= 3) {
        console.log('3')
      }
    },
  })

  const handlePointEvents = (e: L.LatLng) => {
    let lat = e.lat
    let lng = e.lng
    console.log({ lat }, { lng })
    let dir = true
    mapC = e.lat.toFixed(6) + '  /  ' + e.lng.toFixed(6)
    let dmsLat = ConvertDEGToDMS(e.lat, dir)
    dir = false
    let dmsLng = ConvertDEGToDMS(e.lng, dir)
    dmsC = dmsLat + ' / ' + dmsLng
    return (
      <div hidden>
        {lat} {lng}
        {dmsC}
        <br />
        {mapC}
      </div>
    )
  }
  // Distance based on measurements
  const pathDist: number = useMemo(
    () => calculateDistance(measurements),
    [measurements]
  )
  // Area based on measurements
  const sfcArea: number = useMemo(
    () => calculateSurfaceArea(measurements),
    [measurements]
  )

  let m = (pathDist * 1000).toFixed(2)
  let km = pathDist.toFixed(2)
  let m2 = sfcArea.toFixed(2)

  // Point Component
  const PointComponent = () => (
    <Circle center={measurements[0]} radius={25} color={color}>
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
              <br />
              <hr></hr>
              <br />
            </li>
          </>
          <ClickOptions />
        </ul>
      </Popup>
    </Circle>
  )
  // Polyline Component
  const PolylineComponent = () => (
    <Polyline positions={measurements} color={color}>
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
              <br />
              <hr></hr>
              <br />
            </li>
          </>
          <ClickOptions />
        </ul>
      </Popup>
    </Polyline>
  )
  // Polygon Component
  const PolygonComponent = () => (
    <Polygon ref={polygonRef} positions={measurements} color={color}>
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
                {m2.toString().replace(regex, ',')} Sq. Meters{' '}
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
  )

  const ClickOptions = () => (
    <li>
      {handleCenterClick ? (
        <a
          style={measStyleLink}
          onClick={handleCenterClick}
          className="hover:text-blue-200"
        >
          <FontAwesomeIcon icon={faArrowsToCircle} /> Center on this{' '}
          {feature.current}
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
      {measurements.map((m) => (
        <>
          <Circle
            center={{
              lat: m.lat,
              lng: m.lng,
            }}
            fillColor={color}
            fillOpacity={1}
            color={color}
            radius={25}
            eventHandlers={{
              click: () => {
                setIsPopupOpen(true)
              },
            }}
          />
        </>
      ))}

      {/* {isPoint.current && isPopupOpen ? ( */}
      {isPoint.current && !isPopupOpen ? (
        <>
          <PointComponent />
        </>
      ) : isLine.current ? (
        <>
          <PolylineComponent />
        </>
      ) : (
        <>
          <PolygonComponent />
        </>
      )}
    </>
  )
}
