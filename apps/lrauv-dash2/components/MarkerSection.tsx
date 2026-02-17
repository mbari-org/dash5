import React from 'react'
import { useMarkers } from './MarkerContext'
import { createLogger } from '@mbari/utils'

const logger = createLogger('MarkerSection')

export const MarkerSection: React.FC = () => {
  const {
    markers,
    toggleMarkerVisibility,
    updateMarker,
    deleteMarker,
    removeMarkerFromLayer,
  } = useMarkers()

  // Only show markers that are saved to layer
  const savedMarkers = markers.filter((marker) => marker.savedToLayer)

  if (savedMarkers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No markers saved to layers yet
      </div>
    )
  }

  return (
    <div className="marker-list px-2">
      {savedMarkers.map((marker) => (
        <div
          key={marker.id}
          className="marker-item flex items-center justify-between border-b border-gray-200 py-2"
        >
          <div className="flex items-center">
            <label
              className="flex cursor-pointer items-center"
              htmlFor={`marker-visibility-${marker.id}`}
            >
              <input
                id={`marker-visibility-${marker.id}`}
                type="checkbox"
                checked={marker.visible}
                onChange={() => toggleMarkerVisibility(marker.id.toString())}
                className="mr-2"
                aria-label={`Toggle visibility for ${
                  marker.label || 'Unnamed Marker'
                }`}
              />
              <div>
                <div className="font-medium">
                  {marker.label || 'Unnamed Marker'}
                </div>
                <div className="text-xs text-gray-500">
                  ({marker.lat.toFixed(5)}, {marker.lng.toFixed(5)})
                </div>
              </div>
            </label>
          </div>
          <div className="flex">
            <button
              onClick={() => {
                const newName = prompt('Rename marker:', marker.label)
                if (newName) {
                  updateMarker(marker.id.toString(), { label: newName })
                }
              }}
              className="mr-2 text-blue-500 hover:text-blue-700"
              aria-label={`Rename ${marker.label || 'Unnamed Marker'}`}
            >
              <span role="img" aria-label="Edit">
                ✏️
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm('Remove this marker from map layers?')) {
                  removeMarkerFromLayer(marker.id.toString())
                }
              }}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${
                marker.label || 'Unnamed Marker'
              } from layers`}
            >
              <span role="img" aria-label="Remove">
                🗑️
              </span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
