import React from 'react'
import { useSelectedStations } from './SelectedStationsContext'

// Define proper types for your station objects
interface StationGeometry {
  type: string
  coordinates: [number, number]
}

interface StationProperties {
  color: string
  [key: string]: any // For any other properties
}

interface StationGeoJSON {
  type: string
  geometry: StationGeometry
  properties: StationProperties
}

interface Station {
  id: number
  name: string
  lat: number
  lon: number
  geojson: StationGeoJSON
}

interface StationSectionProps {
  name: string
  items: Station[]
}

export const StationSection: React.FC<StationSectionProps> = ({
  name,
  items,
}) => {
  const { selectedStations, toggleStation } = useSelectedStations()

  // Debug logging (can be removed in production)
  console.log(`Rendering StationSection for ${name}`)
  console.log('Items:', items)

  return (
    <div>
      {/* <div className="group-name font-semibold">{name}</div> */}
      <ul className="tree">
        {items && items.length > 0 ? (
          items.map((station, index) => {
            // Safely check if geojson exists before accessing it
            const hasGeojson = !!station?.geojson

            // Log the station information for debugging
            // console.log(`Station name: ${station.name}`)
            // console.log(`Full station object:`, station)
            // console.log(`GeoJSON available: ${hasGeojson}`)

            return (
              <li key={`${station.name}-${index}`}>
                <label
                  className="flex cursor-pointer items-center"
                  style={{ marginLeft: '15px' }}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedStations.includes(station)}
                    onChange={() => toggleStation(station)}
                  />
                  <span>
                    {station.name}
                    {/* {hasGeojson && station.geojson.properties?.color && (
                      <span
                        className="ml-2 inline-block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: station.geojson.properties.color,
                        }}
                      />
                    )} */}
                  </span>
                </label>
              </li>
            )
          })
        ) : (
          <li>No stations available</li>
        )}
      </ul>
    </div>
  )
}
