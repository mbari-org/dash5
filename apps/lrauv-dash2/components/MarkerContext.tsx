import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
// Note: Backend markers API is not ready. Markers saved to map layers use
// localStorage so they survive browser refreshes. API helpers stay commented
// out until a backend markers endpoint is integrated.
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
import { useConfirm } from './ConfirmContext'

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
  removeAllMarkersFromLayer: () => void
  clearAllMarkers: () => void
  selectAllMarkers: () => void
  deselectAllMarkers: () => void
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>
}

// Storage key for localStorage — only markers with savedToLayer persist
const STORAGE_KEY = 'lrauv-map-markers'

// Create context
const MarkerContext = createContext<MarkerContextType | undefined>(undefined)

const readStoredLayerMarkers = (): MarkerData[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MarkerData[]
    if (!Array.isArray(parsed)) return []
    // Only restore markers explicitly saved to the layer (ignore legacy session entries)
    return parsed.filter((marker) => marker.savedToLayer === true)
  } catch (error) {
    logger.error('Error loading markers from localStorage:', error)
    return []
  }
}

const persistLayerMarkers = (markers: MarkerData[]): void => {
  if (typeof window === 'undefined') return
  try {
    const layerMarkers = markers.filter((marker) => marker.savedToLayer)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layerMarkers))
    logger.debug('Saved markers to localStorage:', layerMarkers.length)
  } catch (error) {
    logger.error('Error saving markers to localStorage:', error)
  }
}

// Provider component
export const MarkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)
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
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const confirm = useConfirm()

  // Load after mount so SSR/static export never persists an empty [] over storage
  useEffect(() => {
    setMarkers(readStoredLayerMarkers())
    setHasHydrated(true)
  }, [])

  // Persist only layer-saved markers (session-only markers stay in memory)
  useEffect(() => {
    if (!hasHydrated) return
    persistLayerMarkers(markers)
  }, [markers, hasHydrated])

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
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) => {
          if (marker.id.toString() !== markerId) return marker

          const newVisibility =
            setVisible !== undefined
              ? setVisible
              : marker.visible === false
              ? true
              : false

          return {
            ...marker,
            visible: newVisibility,
          }
        })
      )
    },
    []
  )

  // Save marker to mapLayersList layer
  const saveMarkerToLayer = useCallback((markerId: string) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) => {
        if (marker.id.toString() === markerId) {
          return {
            ...marker,
            savedToLayer: true,
            visible: true, // Make visible by default when saving to layer
          }
        }
        return marker
      })
    )
  }, [])

  // Remove marker from mapLayersList layer
  const removeMarkerFromLayer = useCallback((markerId: string) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) => {
        if (marker.id.toString() === markerId) {
          // Remove from layer but keep in local state
          return {
            ...marker,
            savedToLayer: false,
          }
        }
        return marker
      })
    )
  }, [])

  // Remove all markers from layer; keep them on the map
  const removeAllMarkersFromLayer = useCallback(() => {
    if (
      !window.confirm(
        'Remove all markers from layer? They will remain on the map.'
      )
    ) {
      return
    }

    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.savedToLayer ? { ...marker, savedToLayer: false } : marker
      )
    )

    toast.success('All markers removed from layer', {
      duration: 3000,
      className: 'blue-toast',
    })
  }, [])

  // Permanently delete every marker from the map
  const clearAllMarkers = useCallback(async () => {
    const isConfirmed = await confirm({
      title:
        'Are you sure you want to remove all markers? This cannot be undone.',
    })
    if (isConfirmed) {
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

      // Remove the marker from the array (persist effect updates localStorage)
      setMarkers((prev) => prev.filter((marker) => marker.id !== numericId))

      // If the deleted marker was selected, clear selection
      if (selectedMarkerId === id) {
        setSelectedMarkerId(null)
      }

      // If the deleted marker was being edited, reset active edit marker
      if (activeEditMarkerId === id) {
        setActiveEditMarkerId(null)
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

      setMarkers((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                lat: newPosition.lat,
                lng: newPosition.lng,
                isNew: false, // Not new after dragging
              }
            : m
        )
      )

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

  const value: MarkerContextType = {
    markers,
    selectedMarkers,
    isAddingMarkers,
    activeEditMarkerId,
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
    removeAllMarkersFromLayer,
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
