import React from 'react'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { GetStationsResponse } from '@mbari/api-client'
import { TreeItem } from './MapLayersTreeItem'
import { useSelectedStations } from './SelectedStationContext'
import { useMapCamera } from './MapCameraContext'

type StationItem = GetStationsResponse

interface FlyToRequest {
  lat: number
  lon: number
  bounds?: [[number, number], [number, number]]
}

interface SelectedStation {
  name: string
  lat: number
  lon: number
  geojson: {
    geometry: { type: string; coordinates: [number, number] }
    properties?: { color?: string; weight?: number }
  }
}

interface StationsLayerSectionProps {
  isFiltering: boolean
  filteredStations: StationItem[]
  stations: StationItem[] | undefined
  validStations: StationItem[]
  selectedStations: SelectedStation[]
  expandedSections: { stations: boolean }
  starredSet: Set<string>
  isStationSelected: (name: string) => boolean
  toggleExpanded: (section: 'stations') => void
  handleToggleSelectAllStations: () => void
  setSelectedStations: React.Dispatch<React.SetStateAction<SelectedStation[]>>
}

export const StationsLayerSection: React.FC<StationsLayerSectionProps> = ({
  isFiltering,
  filteredStations,
  stations,
  validStations,
  selectedStations,
  expandedSections,
  starredSet,
  isStationSelected,
  toggleExpanded,
  handleToggleSelectAllStations,
  setSelectedStations,
}) => {
  // Call context hooks directly — same pattern as the original MapLayersListModal.
  // This ensures setHighlightedStationName and toggleStarStation are always the
  // live context dispatch functions, not stale prop references.
  const { setHighlightedStationName, toggleStarStation } = useSelectedStations()
  const { setFlyToRequest } = useMapCamera()

  if (isFiltering && filteredStations.length === 0) return null
  return (
    <TreeItem
      label="Stations"
      isExpanded={
        isFiltering ? filteredStations.length > 0 : expandedSections.stations
      }
      isChecked={
        validStations.length > 0 &&
        selectedStations.filter((s) =>
          validStations.some((v) => v.name === s.name)
        ).length === validStations.length
      }
      onToggleExpand={() => toggleExpanded('stations')}
      onToggleCheck={
        validStations.length > 0 ? handleToggleSelectAllStations : undefined
      }
      icon={faCircle}
      iconColor="white"
      disabled={validStations.length === 0}
    >
      {filteredStations.map((station) => {
        const coords = station.geojson?.geometry?.coordinates
        const stationLon = coords?.[0]
        const stationLat = coords?.[1]
        const hasValidCoords =
          Number.isFinite(stationLat as number) &&
          Number.isFinite(stationLon as number)

        return (
          <TreeItem
            key={`station-${station.name}`}
            label={station.name}
            disabled={!hasValidCoords}
            disabledTitle="No valid coordinates"
            isChecked={isStationSelected(station.name)}
            onToggleCheck={() => {
              if (isStationSelected(station.name)) {
                setSelectedStations(
                  selectedStations.filter((s) => s.name !== station.name)
                )
              } else if (hasValidCoords) {
                setSelectedStations([
                  ...selectedStations,
                  {
                    name: station.name,
                    geojson: station.geojson,
                    lat: stationLat as number,
                    lon: stationLon as number,
                  },
                ])
              }
            }}
            isStarred={starredSet.has(station.name)}
            onStarClick={() => {
              const isCurrentlyStarred = starredSet.has(station.name)
              if (isCurrentlyStarred) {
                setHighlightedStationName(null)
              } else {
                setHighlightedStationName(station.name)
              }
              toggleStarStation(station.name)
            }}
            onMouseEnterStar={() => {
              if (starredSet.has(station.name)) {
                setHighlightedStationName(station.name)
              }
            }}
            onMouseLeaveStar={() => setHighlightedStationName(null)}
            onCenterClick={
              hasValidCoords
                ? () =>
                    setFlyToRequest({
                      lat: stationLat as number,
                      lon: stationLon as number,
                    })
                : undefined
            }
            centerLabel="Center map on this station"
          />
        )
      })}
      {stations !== undefined && stations.length === 0 ? (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No stations available
        </div>
      ) : null}
    </TreeItem>
  )
}
