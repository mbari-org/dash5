import React from 'react'
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'

interface PolygonItem {
  name: string
}

interface PolygonBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

interface FlyToRequest {
  lat: number
  lon: number
  bounds?: [[number, number], [number, number]]
}

interface PolygonsLayerSectionProps {
  isFiltering: boolean
  filteredPolygons: PolygonItem[]
  polygons: PolygonItem[] | undefined
  selectedPolygons: string[]
  expandedSections: { polygons: boolean }
  polygonBoundsMap: Map<string, PolygonBounds | null>
  toggleExpanded: (section: 'polygons') => void
  setSelectedPolygons: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
  setFlyToRequest: (req: FlyToRequest) => void
}

export const PolygonsLayerSection: React.FC<PolygonsLayerSectionProps> = ({
  isFiltering,
  filteredPolygons,
  polygons,
  selectedPolygons,
  expandedSections,
  polygonBoundsMap,
  toggleExpanded,
  setSelectedPolygons,
  setFlyToRequest,
}) => {
  if (isFiltering && filteredPolygons.length === 0) return null
  const polygonNames = (polygons ?? []).map((p) => p.name)
  const allPolygonsSelected =
    polygonNames.length > 0 &&
    polygonNames.every((n) => selectedPolygons.includes(n))

  return (
    <TreeItem
      label="Polygons"
      isExpanded={
        isFiltering ? filteredPolygons.length > 0 : expandedSections.polygons
      }
      isChecked={allPolygonsSelected}
      onToggleExpand={() => toggleExpanded('polygons')}
      onToggleCheck={
        polygonNames.length > 0
          ? () => {
              if (allPolygonsSelected) {
                setSelectedPolygons([])
              } else {
                setSelectedPolygons(polygonNames)
              }
            }
          : undefined
      }
      disabled={(polygons?.length ?? 0) === 0}
      icon={faDrawPolygon}
      iconColor="#6366f1"
    >
      {filteredPolygons.map((polygon) => {
        const polygonBounds = polygonBoundsMap.get(polygon.name) ?? null
        return (
          <TreeItem
            key={`polygon-${polygon.name}`}
            label={polygon.name}
            isChecked={selectedPolygons.includes(polygon.name)}
            onToggleCheck={() => {
              setSelectedPolygons((prev) =>
                prev.includes(polygon.name)
                  ? prev.filter((n) => n !== polygon.name)
                  : [...prev, polygon.name]
              )
            }}
            onCenterClick={
              polygonBounds
                ? () =>
                    setFlyToRequest({
                      lat: (polygonBounds.minLat + polygonBounds.maxLat) / 2,
                      lon: (polygonBounds.minLon + polygonBounds.maxLon) / 2,
                      bounds: [
                        [polygonBounds.minLat, polygonBounds.minLon],
                        [polygonBounds.maxLat, polygonBounds.maxLon],
                      ],
                    })
                : undefined
            }
            centerLabel="Center map on this polygon"
          />
        )
      })}
      {polygons !== undefined && polygons.length === 0 ? (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No polygons available
        </div>
      ) : null}
    </TreeItem>
  )
}
