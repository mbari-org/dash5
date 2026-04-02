import React from 'react'
import { GeoJSON, Tooltip } from 'react-leaflet'
import { usePolygons } from '@mbari/api-client'
import { useSelectedPolygons } from './SelectedPolygonsContext'

const PolygonLayers: React.FC = () => {
  const { data: polygons } = usePolygons()
  const { selectedPolygons } = useSelectedPolygons()

  if (!polygons || selectedPolygons.length === 0) return null

  return (
    <>
      {polygons
        .filter((p) => selectedPolygons.includes(p.name))
        .map((p) => {
          const color = p.geojson.properties?.color ?? '#3388ff'
          return (
            <GeoJSON
              key={p.name}
              data={p.geojson as unknown as GeoJSON.GeoJsonObject}
              style={() => ({
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.15,
              })}
            >
              <Tooltip sticky>{p.name}</Tooltip>
            </GeoJSON>
          )
        })}
    </>
  )
}

export default PolygonLayers
