import React, { useCallback } from 'react'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'
import { MarkerData, useMarkers } from './MarkerContext'
import { useMapCamera } from './MapCameraContext'
import { useConfirm } from './ConfirmContext'

interface MarkersLayerSectionProps {
  isFiltering: boolean
  filteredMarkers: MarkerData[]
  layerMarkers: MarkerData[]
  expandedSections: { markers: boolean }
  toggleExpanded: (section: 'markers') => void
  handleToggleSelectAllMarkers: () => void
  toggleMarkerVisibility: (id: string) => void
}

export const VISIBILITY_TOOLTIP = 'Show/hide on map (stays in layer)'
export const VISIBILITY_ALL_TOOLTIP =
  'Show/hide all markers on map (stay in layer)'

/** Clamp latitude to ±90 and wrap longitude into ±180 for map display. */
export const normalizeMapCoords = (
  lat: number,
  lng: number
): { lat: number; lon: number } | null => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const normalizedLat = Math.max(-90, Math.min(90, lat))
  const normalizedLon = ((((lng + 180) % 360) + 360) % 360) - 180
  return { lat: normalizedLat, lon: normalizedLon }
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
  // Call context hooks directly — same pattern as StationsLayerSection.
  const { removeMarkerFromLayer, removeAllMarkersFromLayer } = useMarkers()
  const { setFlyToRequest } = useMapCamera()
  const confirm = useConfirm()

  const handleRemoveFromLayer = useCallback(
    async (id: string, label: string) => {
      const isConfirmed = await confirm({
        title: `Remove "${label}" from layer? It will remain on the map.`,
      })
      if (isConfirmed) removeMarkerFromLayer(id)
    },
    [confirm, removeMarkerFromLayer]
  )

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
        layerMarkers.length > 0 ? VISIBILITY_ALL_TOOLTIP : undefined
      }
      icon={faMapMarkerAlt}
      iconColor="red"
      disabled={layerMarkers.length === 0}
    >
      {filteredMarkers.map((marker) => {
        const markerLabel = marker.label || `Marker ${marker.id}`
        const mapCoords = normalizeMapCoords(marker.lat, marker.lng)
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
              mapCoords ? () => setFlyToRequest(mapCoords) : undefined
            }
            centerLabel={`Center map on ${markerLabel}`}
            onRemoveClick={() =>
              handleRemoveFromLayer(String(marker.id), markerLabel)
            }
            removeLabel={`Remove ${markerLabel} from layer`}
          />
        )
      })}
      {layerMarkers.length > 0 ? (
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
      ) : (
        <div className="py-2 pl-10 text-sm italic text-gray-500">
          No markers saved to layer
        </div>
      )}
    </TreeItem>
  )
}
