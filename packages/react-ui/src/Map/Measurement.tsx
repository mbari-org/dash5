import { useState, useMemo, useEffect, useRef } from 'react'
import { Circle, useMapEvents, Popup, Polygon } from 'react-leaflet'
import L from 'leaflet'
import { point, distance, polygon, area } from '@turf/turf'

const color = '#00ff00'

const calculateDistance = (positions: L.LatLng[]): number => {
  let totalDistance = 0
  for (let i = 0; i < positions.length - 1; i++) {
    const from = point([positions[i].lng, positions[i].lat])
    const to = point([positions[i + 1].lng, positions[i + 1].lat])
    totalDistance += distance(from, to)
  }
  return totalDistance
}

const calculateSurfaceArea = (positions: L.LatLng[]): number => {
  const coordinates = positions.map((p) => [p.lng, p.lat])
  coordinates.push(coordinates[0]) // Close the polygon
  if (coordinates.length < 4) {
    return 0
  }
  const shape = polygon([coordinates])
  const surfaceArea = area(shape)
  return surfaceArea
}

const formatNumber = (n: number) => parseFloat(n.toFixed(3)).toLocaleString()

export interface MeasurementProps {
  editing?: boolean
  onDelete?: () => void
}

export const Measurement: React.FC<MeasurementProps> = ({
  editing,
  onDelete: handleDelete,
}) => {
  const [measurements, setMeasurements] = useState([] as L.LatLng[])

  // Remove the last measurement when editing is toggled to false as the useMapEvent handler
  // will fire when the user clicks the done button on the map control.
  const wasEditing = useRef(editing)
  useEffect(() => {
    if (!editing && wasEditing.current) {
      const finalMeasurments = [...measurements]
      finalMeasurments.pop()
      setMeasurements(finalMeasurments)
    }
    wasEditing.current = editing
  }, [editing])

  useMapEvents({
    mouseup(event) {
      if (!editing) return
      setMeasurements([...measurements, event.latlng])
    },
  })

  const distance = useMemo(
    () => calculateDistance(measurements),
    [measurements]
  )
  const area = useMemo(() => calculateSurfaceArea(measurements), [measurements])

  return (
    <>
      {measurements.map((m) => (
        <Circle
          center={{
            lat: m.lat,
            lng: m.lng,
          }}
          fillColor={color}
          fillOpacity={1}
          color={color}
          radius={100}
        />
      ))}
      <Polygon positions={measurements} color={color}>
        <Popup>
          <ul className="flex flex-col">
            <li>
              <span className="text-stone-500">Total distance:</span>{' '}
              <span className="font-bold text-stone-800">
                {formatNumber(distance)} km
              </span>
            </li>
            <li className="py-1">
              <span className="text-stone-500">Total area:</span>{' '}
              <span className="font-bold text-stone-800">
                {formatNumber(area)} sq. meters
              </span>
            </li>
            {handleDelete ? (
              <li>
                <button
                  className="rounded bg-primary-600 py-1 px-2 text-xs text-white"
                  onClick={handleDelete}
                >
                  Remove
                </button>
              </li>
            ) : null}
          </ul>
        </Popup>
      </Polygon>
    </>
  )
}
