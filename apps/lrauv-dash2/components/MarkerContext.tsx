import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'

const logger = createLogger('MarkerContext')

// Define marker type
export interface MarkerData {
  id: number
  lat: number
  lng: number
  index: number
  label: string
  iconColor?: string
  isNew?: boolean
  visible?: boolean
  savedToLayer?: boolean
}

// Context interface
export interface MarkerContextType {
  markers: MarkerData[]
  selectedMarkers: MarkerData[]
  isAddingMarkers: boolean
  activeEditMarkerId: string | null
  setIsAddingMarkers: React.Dispatch<React.SetStateAction<boolean>>
  setActiveEditMarkerId: (id: string | null) => void
  handleAddMarker: (lat: number, lng: number) => number
  handleMarkerLabelChange: (id: string, newLabel: string) => void
  handleMarkerColorChange: (id: string, color: string) => void
  handleMarkerDelete: (id: string) => void
  handleMarkerDragEnd: (
    id: number,
    position: { lat: number; lng: number }
  ) => void
  handleToggleMarkerMode: () => void
  toggleMarkerVisibility: (id: string) => void
  handleMarkersRequest: () => void
  handleMarkerSave: (id: string, currentLabel?: string) => void
  addMarker: (marker: Omit<MarkerData, 'id'>) => void
  updateMarker: (id: string, updates: Partial<MarkerData>) => void
  deleteMarker: (id: string) => void
  saveMarkerToLayer: (id: string) => void
  removeMarkerFromLayer: (id: string) => void
  clearAllMarkers: () => void
  selectAllMarkers: () => void
  deselectAllMarkers: () => void
}

// Storage key for localStorage
const STORAGE_KEY = 'lrauv-map-markers'

// Create context
const MarkerContext = createContext<MarkerContextType | null>(null)

// Provider component
export const MarkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [selectedMarkers, setSelectedMarkers] = useState<MarkerData[]>([])
  const [isAddingMarkers, setIsAddingMarkers] = useState(false)
  const [activeEditMarkerId, setActiveEditMarkerId] = useState<string | null>(
    null
  )
  const selectAllMarkers = useCallback(() => {
    const allLayerMarkers = markers.filter((marker) => marker.savedToLayer)
    setSelectedMarkers(allLayerMarkers)
  }, [markers])
  const deselectAllMarkers = useCallback(() => {
    setSelectedMarkers([])
  }, [])

  // Load markers from localStorage on initial mount
  useEffect(() => {
    try {
      const savedMarkers = localStorage.getItem(STORAGE_KEY)
      if (savedMarkers) {
        const parsedMarkers = JSON.parse(savedMarkers) as MarkerData[]
        setMarkers(parsedMarkers)
        logger.debug('Loaded markers from localStorage:', parsedMarkers.length)
      }
    } catch (error) {
      logger.error('Error loading markers from localStorage:', error)
    }
  }, [])

  // Save markers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(markers))
      logger.debug('Saved markers to localStorage:', markers.length)
    } catch (error) {
      logger.error('Error saving markers to localStorage:', error)
    }
  }, [markers])

  const handleToggleMarkerMode = useCallback(() => {
    setIsAddingMarkers((prev) => !prev)
  }, [])

  const handleMarkersRequest = useCallback(() => {
    logger.debug('Markers request initiated')
  }, [])

  const handleAddMarker = useCallback(
    (lat: number, lng: number) => {
      const newId =
        markers.length > 0 ? Math.max(...markers.map((m) => m.id)) + 1 : 1

      setMarkers((prev) => [
        ...prev,
        {
          id: newId,
          lat,
          lng,
          index: prev.length,
          label: `Marker ${prev.length + 1}`,
          iconColor: '#FF0000', // Default color
          isNew: true,
        },
      ])

      // Automatically exit marker adding mode after placing marker
      setIsAddingMarkers(false)
      // Set this new marker as the active edit marker
      setActiveEditMarkerId(newId.toString())

      return newId
    },
    [markers]
  )

  const handleMarkerSave = useCallback(
    (id: string, currentLabel?: string) => {
      const marker = markers.find((m) => m.id.toString() === id)

      if (marker) {
        const isNew = marker.isNew
        // Use the current label from input if provided, otherwise use the stored label
        const markerLabel = currentLabel || marker.label || 'Unknown'

        // Update the marker to no longer be new (and update label if provided)
        setMarkers((prev) =>
          prev.map((m) =>
            m.id.toString() === id
              ? {
                  ...m,
                  isNew: false,
                  // Update label if currentLabel is provided
                  ...(currentLabel ? { label: currentLabel } : {}),
                }
              : m
          )
        )

        // Only show the toast message if the marker was new
        if (isNew) {
          toast.success(
            <div className="toast-content">
              <div>
                Marker <b>{markerLabel}</b> saved.
              </div>
              <div>You can now drag or edit it.</div>
            </div>,
            {
              duration: 3000,
              className: 'blue-toast',
            }
          )
        }

        // Reset active edit marker ID
        setActiveEditMarkerId(null)
      }
    },
    [markers]
  )

  const toggleMarkerVisibility = useCallback(
    (id: string) => {
      const numericId = parseInt(id, 10)
      setMarkers((prev) =>
        prev.map((marker) =>
          marker.id === numericId
            ? { ...marker, visible: !marker.visible }
            : marker
        )
      )
      // Save the updated markers state
      localStorage.setItem(
        'savedMarkers',
        JSON.stringify(
          markers.map((m) =>
            m.id === numericId ? { ...m, visible: !m.visible } : m
          )
        )
      )
    },
    [markers]
  )

  const saveMarkerToLayer = useCallback(
    (id: string) => {
      const numericId = parseInt(id, 10)

      // Get the marker with its CURRENT position (after any drag operations)
      const markerToSave = markers.find((m) => m.id === numericId)

      if (markerToSave) {
        logger.debug(
          `Saving marker ${numericId} to layer at position [${markerToSave.lat}, ${markerToSave.lng}]`
        )

        setMarkers((prev) => {
          // Create updated array with savedToLayer flag set to true
          const updated = prev.map((marker) =>
            marker.id === numericId ? { ...marker, savedToLayer: true } : marker
          )

          // Immediately update both storage locations with the CURRENT position
          localStorage.setItem('savedMarkers', JSON.stringify(updated))
          localStorage.setItem(
            'layerMarkers',
            JSON.stringify(updated.filter((m) => m.savedToLayer))
          )

          return updated
        })
      } else {
        logger.error(
          `Marker ${numericId} not found when trying to save to layer`
        )
      }
    },
    [markers] // Keep markers positions up-to-date
  )

  const removeMarkerFromLayer = useCallback(
    (id: string) => {
      const numericId = parseInt(id, 10)
      setMarkers((prev) =>
        prev.map((marker) =>
          marker.id === numericId ? { ...marker, savedToLayer: false } : marker
        )
      )

      // Update local storage
      localStorage.setItem(
        'layerMarkers',
        JSON.stringify(
          markers.filter((m) => m.id !== numericId && m.savedToLayer)
        )
      )
    },
    [markers]
  )

  // Add function to clear all markers
  const clearAllMarkers = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to remove all markers? This cannot be undone.'
      )
    ) {
      setMarkers([])
      toast.success('All markers have been removed', {
        duration: 3000,
        className: 'blue-toast',
      })
    }
  }, [])

  const addMarker = useCallback(
    (markerData: Omit<MarkerData, 'id'>) => {
      const newId =
        markers.length > 0 ? Math.max(...markers.map((m) => m.id)) + 1 : 1

      setMarkers((prev) => [
        ...prev,
        {
          ...markerData,
          id: newId,
        },
      ])

      return newId
    },
    [markers]
  )

  // Update an existing marker
  const updateMarker = useCallback(
    (id: string, updates: Partial<MarkerData>) => {
      const numericId = parseInt(id, 10)
      setMarkers((prev) =>
        prev.map((marker) =>
          marker.id === numericId ? { ...marker, ...updates } : marker
        )
      )
    },
    []
  )

  // Delete a marker by id
  const deleteMarker = useCallback(
    (id: string) => {
      const numericId = parseInt(id, 10)
      setMarkers((prev) => prev.filter((marker) => marker.id !== numericId))

      // If the deleted marker was being edited, reset active edit marker
      if (activeEditMarkerId === id) {
        setActiveEditMarkerId(null)
      }
    },
    [activeEditMarkerId]
  )

  const handleMarkerLabelChange = useCallback(
    (id: string, newLabel: string) => {
      const marker = markers.find((m) => m.id.toString() === id)
      const oldLabel = marker?.label || 'Unknown'

      if (marker) {
        // Check if the marker is new and if label actually changed
        const isNew = marker.isNew
        const hasLabelChanged = oldLabel !== newLabel

        // Update the marker to no longer be new and set the new label
        setMarkers((prev) =>
          prev.map((m) =>
            m.id.toString() === id ? { ...m, isNew: false, label: newLabel } : m
          )
        )

        // Only show the toast message if:
        // 1. The marker is NOT new (existing marker)
        // 2. The label has actually changed
        if (!isNew && hasLabelChanged) {
          toast.success(
            <div className="toast-content">
              <div>
                Marker <b>{oldLabel}</b>
              </div>
              <div>
                renamed to <b>{newLabel}</b>
              </div>
            </div>,
            { duration: 3000, className: 'blue-toast' }
          )
        }

        // Reset active edit marker ID
        setActiveEditMarkerId(null)
      }
    },
    [markers]
  )

  const handleMarkerColorChange = useCallback((id: string, color: string) => {
    logger.debug(`Marker ${id}: color updated to ${color}`)
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id.toString() === id
          ? { ...marker, iconColor: color, isNew: false }
          : marker
      )
    )
  }, [])

  const handleMarkerDelete = useCallback(
    (id: string) => {
      // Find the marker before deleting it
      const markerToDelete = markers.find((m) => m.id.toString() === id)
      const markerLabel = markerToDelete?.label || 'Unknown'

      // Delete the marker
      setMarkers((prev) => prev.filter((marker) => marker.id.toString() !== id))

      // Show toast message with the marker label
      toast.success(
        <div className="toast-content">
          <div>
            Marker <b>{markerLabel}</b> has been deleted
          </div>
        </div>,
        { duration: 3000, className: 'blue-toast' }
      )

      // If the deleted marker was being edited, reset active edit marker
      if (activeEditMarkerId === id) {
        setActiveEditMarkerId(null)
      }
    },
    [markers, activeEditMarkerId]
  )

  // Handle marker drag end event
  const handleMarkerDragEnd = useCallback(
    (id: number, newPosition: { lat: number; lng: number }) => {
      logger.debug(
        `Marker ${id} dragged to [${newPosition.lat}, ${newPosition.lng}]`
      )

      // Find the marker to include its label in the toast
      const marker = markers.find((m) => m.id === id)

      setMarkers((prev) => {
        // Create updated array with new position
        const updated = prev.map((m) =>
          m.id === id
            ? {
                ...m,
                lat: newPosition.lat,
                lng: newPosition.lng,
                isNew: false, // Mark as not new after dragging
              }
            : m
        )

        // If this marker is already saved to layer, update the layer storage too
        const draggedMarker = updated.find((m) => m.id === id)
        if (draggedMarker?.savedToLayer) {
          localStorage.setItem(
            'layerMarkers',
            JSON.stringify(updated.filter((m) => m.savedToLayer))
          )
          logger.debug(`Updated layer storage for marker ${id}`)
        }

        // Always update the main storage
        localStorage.setItem('savedMarkers', JSON.stringify(updated))

        return updated
      })

      // Show toast message with the marker label
      if (marker) {
        toast.success(
          <div className="toast-content">
            <div>
              Moved Marker: <b>{marker.label}</b>
            </div>
            <div>
              to{' '}
              <b>
                {newPosition.lat.toFixed(5)}, {newPosition.lng.toFixed(5)}
              </b>
            </div>
          </div>,
          { duration: 2000, className: 'blue-toast' }
        )
      }
    },
    [markers]
  )

  const value = {
    markers,
    selectedMarkers,
    isAddingMarkers,
    setIsAddingMarkers,
    activeEditMarkerId,
    setActiveEditMarkerId,
    handleAddMarker,
    handleMarkerLabelChange,
    handleMarkerColorChange,
    handleMarkerDelete,
    handleMarkerDragEnd,
    handleToggleMarkerMode,
    handleMarkersRequest,
    handleMarkerSave,
    clearAllMarkers,
    addMarker,
    updateMarker,
    deleteMarker,
    toggleMarkerVisibility,
    removeMarkerFromLayer,
    saveMarkerToLayer,
    selectAllMarkers,
    deselectAllMarkers,
  }

  return (
    <MarkerContext.Provider value={value}>{children}</MarkerContext.Provider>
  )
}

// Custom hook
export const useMarkers = () => {
  const context = useContext(MarkerContext)
  if (!context) {
    throw new Error('useMarkers must be used within a MarkerProvider')
  }
  return context
}
