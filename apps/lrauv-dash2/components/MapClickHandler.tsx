import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'

const logger = createLogger('MapClickHandler')

interface MapClickHandlerProps {
  isAddingMarkers: boolean
  isEditingMarker?: boolean
  // onAddMarker: (lat: number, lng: number) => void
  onAddMarker: (lat: number, lng: number, label?: string) => void
  onCancelAdd?: () => void
}
/// Function to handle map clicks and add markers
const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  isAddingMarkers,
  isEditingMarker = false,
  onAddMarker,
  onCancelAdd, //New
}) => {
  // Use refs to track the latest values
  const isAddingMarkersRef = useRef(isAddingMarkers)
  const isEditingMarkerRef = useRef(isEditingMarker)

  // Update the ref when the prop changes
  useEffect(() => {
    isAddingMarkersRef.current = isAddingMarkers
    isEditingMarkerRef.current = isEditingMarker
  }, [isAddingMarkers, isEditingMarker])

  // Track click targets to avoid adding markers when clicking controls
  const clickTargetRef = useRef<EventTarget | null>(null)

  // Set up event handler for mousedown to track what was initially clicked
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      clickTargetRef.current = e.target
    }

    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Use Leaflet's map events
  const map = useMapEvents({
    mousedown: (e) => {
      // Save the initial target element
      clickTargetRef.current = e.originalEvent.target as HTMLElement
    },

    click: (e) => {
      // First check if we're in marker adding mode
      if (!isAddingMarkersRef.current) return

      // Don't add markers if we're currently editing a marker
      if (isEditingMarkerRef.current) {
        logger.debug('Marker is being edited, not adding new marker')
        toast('Please finish editing current marker first')
        return
      }

      // Get the original DOM event target
      const target = e.originalEvent.target as HTMLElement
      const initialTarget = clickTargetRef.current as HTMLElement

      // Check if click started or ended on a control - Allows for clicking
      const isControlClick =
        target.closest('.leaflet-control') ||
        (initialTarget && initialTarget.closest('.leaflet-control')) ||
        target.classList.contains('toggle-markers') ||
        target.parentElement?.classList.contains('toggle-markers') ||
        (initialTarget && initialTarget.classList.contains('toggle-markers')) ||
        (initialTarget &&
          initialTarget.parentElement?.classList.contains('toggle-markers'))

      // Don't add marker if clicking controls
      if (isControlClick) {
        logger.debug('Click on control detected, not adding marker')
        return
      }

      // Create the marker with default or empty label
      onAddMarker(e.latlng.lat, e.latlng.lng, '')
    },
  })

  // Set cursor style based on mode
  useEffect(() => {
    if (!map) return

    const container = map.getContainer()
    if (container) {
      container.style.cursor = isAddingMarkers ? 'crosshair' : ''
    }

    return () => {
      if (container) {
        container.style.cursor = ''
      }
    }
  }, [map, isAddingMarkers])

  return null
}

export default MapClickHandler
