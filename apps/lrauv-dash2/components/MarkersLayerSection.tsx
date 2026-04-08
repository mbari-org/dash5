import React from 'react'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'

interface MarkerItem {
  id: number | string
  label?: string
  visible?: boolean
  savedToLayer?: boolean
}

interface MarkersLayerSectionProps {
  isFiltering: boolean
  filteredMarkers: MarkerItem[]
  layerMarkers: MarkerItem[]
  expandedSections: { markers: boolean }
  toggleExpanded: (section: 'markers') => void
  handleToggleSelectAllMarkers: () => void
  toggleMarkerVisibility: (id: string) => void
}

export const MarkersLayerSection: React.FC<MarkersLayerSectionProps> = ({
  isFiltering,
  filteredMarkers,
  layerMarkers,
  expandedSections,
  toggleExpanded,
  handleToggleSelectAllMarkers,
  toggleMarkerVisibility,
}) => {
  if (isFiltering && filteredMarkers.length === 0) return null
  return (
    <TreeItem
      label="Markers"
      isExpanded={
        isFiltering ? filteredMarkers.length > 0 : expandedSections.markers
      }
      isChecked={
        layerMarkers.length > 0 &&
        layerMarkers.every((marker) => marker.visible !== false)
      }
      onToggleExpand={() => toggleExpanded('markers')}
      onToggleCheck={
        layerMarkers.length > 0 ? handleToggleSelectAllMarkers : undefined
      }
      icon={faMapMarkerAlt}
      iconColor="red"
      disabled={layerMarkers.length === 0}
    >
      {filteredMarkers.map((marker) => (
        <TreeItem
          key={`marker-${marker.id}`}
          label={marker.label || `Marker ${marker.id}`}
          isChecked={marker.visible !== false}
          onToggleCheck={() => toggleMarkerVisibility(String(marker.id))}
          icon={faMapMarkerAlt}
          iconColor="red"
        />
      ))}
      {layerMarkers.length === 0 && (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No markers saved to layers
        </div>
      )}
    </TreeItem>
  )
}
