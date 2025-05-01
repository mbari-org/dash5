import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
// Temporarily comment out the API imports
// import {
//   getMarkers,
//   createMarker,
//   updateMarker,
//   deleteMarker,
//   batchUpdateMarkers,
//   Marker,
// } from '@mbari/api-client'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'
import { set } from 'msw/lib/types/context'

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
  selectedMarkerId: string | null
  setSelectedMarkerId: (id: string | null) => void
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
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>
}

// Storage key for localStorage
const STORAGE_KEY = 'lrauv-map-markers'

// Create context
const MarkerContext = createContext<MarkerContextType | undefined>(undefined)

// Use mock implementations until API is ready
const getMarkers = async () => {
  const savedMarkers = localStorage.getItem('lrauv-map-markers')
  return savedMarkers ? JSON.parse(savedMarkers) : []
}

// Provider component
export const MarkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [selectedMarkers, setSelectedMarkers] = useState<MarkerData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

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
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [nextId, setNextId] = useState(1)

  // Fetch markers on mount
  useEffect(() => {
    const fetchMarkers = async () => {
      setLoading(true)
      try {
        const response = await getMarkers()
        setMarkers(response)
        setError(null)
      } catch (err) {
        logger.error('Failed to fetch markers:', err)
        setError(
          err instanceof Error ? err : new Error('Failed to fetch markers')
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMarkers()
  }, [])

  // Load markers from localStorage on initial mount
  useEffect(() => {
    try {
      const savedMarkers = localStorage.getItem(STORAGE_KEY)
      if (savedMarkers) {
        const parsedMarkers = JSON.parse(savedMarkers) as MarkerData[]
        setMarkers(parsedMarkers)
        // logger.debug('Loaded markers from localStorage:', parsedMarkers.length)
      }
    } catch (error) {
      logger.error('Error loading markers from localStorage:', error)
    }
  }, [])

  // Save markers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(markers))
      // logger.debug('Saved markers to localStorage:', markers.length)
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
    (markerId: string, setVisible?: boolean) => {
      setMarkers((prevMarkers) => {
        return prevMarkers.map((marker) => {
          if (marker.id.toString() === markerId) {
            // If setVisible is provided, use that value; otherwise toggle
            const newVisibility =
              setVisible !== undefined
                ? setVisible
                : marker.visible === false
                ? true
                : false

            // Rest of your function stays the same...
            if (marker.savedToLayer) {
              const savedMarkers = JSON.parse(
                localStorage.getItem('lrauv-map-markers') || '[]'
              )
              const updatedSavedMarkers = savedMarkers.map((m: any) =>
                m.id.toString() === markerId
                  ? { ...m, visible: newVisibility }
                  : m
              )
              localStorage.setItem(
                'lrauv-map-markers',
                JSON.stringify(updatedSavedMarkers)
              )
            }

            return {
              ...marker,
              visible: newVisibility,
            }
          }
          return marker
        })
      })
    },
    []
  )

  // Save marker to mapLayersList layer
  const saveMarkerToLayer = useCallback((markerId: string) => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.map((marker) => {
        if (marker.id.toString() === markerId) {
          // Mark as saved to layer
          return {
            ...marker,
            savedToLayer: true,
            visible: true, // Make visible by default when saving to layer
          }
        }
        return marker
      })

      // Update storage with saved markers
      const markersToSave = updatedMarkers.filter((m) => m.savedToLayer)
      localStorage.setItem('lrauv-map-markers', JSON.stringify(markersToSave))

      return updatedMarkers
    })
  }, [])

  // Remove marker from mapLayersList layer
  const removeMarkerFromLayer = useCallback((markerId: string) => {
    setMarkers((prevMarkers) => {
      const updatedMarkers = prevMarkers.map((marker) => {
        if (marker.id.toString() === markerId) {
          // Remove from layer but keep in local state
          return {
            ...marker,
            savedToLayer: false,
          }
        }
        return marker
      })

      // Update storage with only saved markers
      const markersToSave = updatedMarkers.filter((m) => m.savedToLayer)
      localStorage.setItem('lrauv-map-markers', JSON.stringify(markersToSave))

      return updatedMarkers
    })
  }, [])

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
        // Show toast message if the marker was new or label changed
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
      logger.debug(`Deleting marker ${id}`)

      const numericId = parseInt(id, 10)

      // Find the marker to get its label for the toast
      const marker = markers.find((m) => m.id === numericId)
      const markerLabel = marker?.label || 'Unnamed'

      // Remove the marker from the array
      setMarkers((prev) => prev.filter((marker) => marker.id !== numericId))

      // If the deleted marker was selected, clear selection
      if (selectedMarkerId === id) {
        setSelectedMarkerId(null)
      }

      // If the deleted marker was being edited, reset active edit marker
      if (activeEditMarkerId === id) {
        setActiveEditMarkerId(null)
      }

      // Also remove from localStorage if it was saved to layer
      if (marker?.savedToLayer) {
        const updatedMarkers = markers.filter(
          (m) => m.id !== numericId && m.savedToLayer
        )
        try {
          localStorage.setItem(
            'lrauv-map-markers',
            JSON.stringify(updatedMarkers)
          )
        } catch (error) {
          logger.error('Error removing marker from storage:', error)
        }
      }

      // Show confirmation toast
      if (marker?.isNew == true) {
        toast.success(
          <div className="toast-content">
            <div>Marker deleted.</div>
          </div>,
          { duration: 2000, className: 'blue-toast' }
        )
      } else if (marker?.isNew == false) {
        toast.success(
          <div className="toast-content">
            <div>
              Marker <b>{markerLabel}</b> deleted.
            </div>
          </div>,
          { duration: 2000, className: 'blue-toast' }
        )
      }
    },
    [markers, selectedMarkerId, activeEditMarkerId]
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
                isNew: false, // Not new after dragging
              }
            : m
        )

        // If this marker is already saved to layer, update the layer storage too
        const draggedMarker = updated.find((m) => m.id === id)
        if (draggedMarker?.savedToLayer) {
          localStorage.setItem(
            'lrauv-map-markers',
            JSON.stringify(updated.filter((m) => m.savedToLayer))
          )
          logger.debug(`Updated layer storage for marker ${id}`)
        }

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
    activeEditMarkerId,
    loading,
    error,
    selectedMarkerId,
    setSelectedMarkerId,
    setIsAddingMarkers,
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
    setMarkers,
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
