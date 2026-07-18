import React from 'react'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'
import { useMarkers } from './MarkerContext'
import { useMapCamera } from './MapCameraContext'

interface MarkerItem {
  id: number | string
  label?: string
  lat?: number
  lng?: number
  iconColor?: string
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

const VISIBILITY_TOOLTIP = 'Show/hide on map (stays in layer)'

export const MarkersLayerSection: React.FC<MarkersLayerSectionProps> = ({
  isFiltering,
  filteredMarkers,
  layerMarkers,
  expandedSections,
  toggleExpanded,
  handleToggleSelectAllMarkers,
  toggleMarkerVisibility,
}) => {
  // Call context hooks directly — same pattern as StationsLayerSection.
  const { removeMarkerFromLayer, removeAllMarkersFromLayer } = useMarkers()
  const { setFlyToRequest } = useMapCamera()

  if (isFiltering && filteredMarkers.length === 0) return null
  return (
    <TreeItem
      label="Markers"
      isExpanded={expandedSections.markers}
      isChecked={
        layerMarkers.length > 0 &&
        layerMarkers.every((marker) => marker.visible !== false)
      }
      onToggleExpand={() => toggleExpanded('markers')}
      onToggleCheck={
        layerMarkers.length > 0 ? handleToggleSelectAllMarkers : undefined
      }
      checkTooltip={
        layerMarkers.length > 0
          ? 'Show/hide all markers on map (stay in layer)'
          : undefined
      }
      icon={faMapMarkerAlt}
      iconColor="red"
      disabled={layerMarkers.length === 0}
    >
      {filteredMarkers.map((marker) => {
        const markerLabel = marker.label || `Marker ${marker.id}`
        const hasValidCoords =
          Number.isFinite(marker.lat) && Number.isFinite(marker.lng)
        return (
          <TreeItem
            key={`marker-${marker.id}`}
            label={markerLabel}
            isChecked={marker.visible !== false}
            onToggleCheck={() => toggleMarkerVisibility(String(marker.id))}
            checkTooltip={VISIBILITY_TOOLTIP}
            icon={faMapMarkerAlt}
            iconColor={marker.iconColor || '#FF0000'}
            onCenterClick={
              hasValidCoords
                ? () =>
                    setFlyToRequest({
                      lat: marker.lat as number,
                      lon: marker.lng as number,
                    })
                : undefined
            }
            centerLabel={`Center map on ${markerLabel}`}
            onRemoveClick={() => {
              if (
                window.confirm(
                  `Remove "${markerLabel}" from layer? It will remain on the map.`
                )
              ) {
                removeMarkerFromLayer(String(marker.id))
              }
            }}
            removeLabel={`Remove ${markerLabel} from layer`}
          />
        )
      })}
      {layerMarkers.length > 0 && (
        <div className="flex justify-end py-2 pl-10 pr-2">
          <button
            type="button"
            onClick={removeAllMarkersFromLayer}
            className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
            aria-label="Remove all from layer"
          >
            Remove all from layer
          </button>
        </div>
      )}
      {layerMarkers.length === 0 && (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No markers saved to layer
        </div>
      )}
    </TreeItem>
  )
}
