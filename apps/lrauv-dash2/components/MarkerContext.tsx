import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import toast from 'react-hot-toast'

// Define marker type
export interface MarkerData {
  id: number
  lat: number
  lng: number
  index: number
  label: string
  iconColor?: string
  isNew?: boolean
}

// Context interface
interface MarkerContextType {
  markers: MarkerData[]
  isAddingMarkers: boolean
  setIsAddingMarkers: React.Dispatch<React.SetStateAction<boolean>>
  activeEditMarkerId: string | null
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
  handleMarkersRequest: () => void
  handleMarkerSave: (id: string, currentLabel?: string) => void
  clearAllMarkers: () => void
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
  const [isAddingMarkers, setIsAddingMarkers] = useState(false)
  const [activeEditMarkerId, setActiveEditMarkerId] = useState<string | null>(
    null
  )

  // Load markers from localStorage on initial mount
  useEffect(() => {
    try {
      const savedMarkers = localStorage.getItem(STORAGE_KEY)
      if (savedMarkers) {
        const parsedMarkers = JSON.parse(savedMarkers) as MarkerData[]
        setMarkers(parsedMarkers)
        console.log('Loaded markers from localStorage:', parsedMarkers.length)
      }
    } catch (error) {
      console.error('Error loading markers from localStorage:', error)
    }
  }, [])

  // Save markers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(markers))
      console.log('Saved markers to localStorage:', markers.length)
    } catch (error) {
      console.error('Error saving markers to localStorage:', error)
    }
  }, [markers])

  const handleToggleMarkerMode = useCallback(() => {
    setIsAddingMarkers((prev) => !prev)
  }, [])

  const handleMarkersRequest = useCallback(() => {
    console.log('Markers request initiated')
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
    console.log(`Marker ${id}: color updated to ${color}`)
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

  const handleMarkerDragEnd = useCallback(
    (id: number, position: { lat: number; lng: number }) => {
      setMarkers((prev) =>
        prev.map((marker) =>
          marker.id === id
            ? {
                ...marker,
                lat: position.lat,
                lng: position.lng,
                isNew: false, // Mark as not new after dragging
              }
            : marker
        )
      )

      const marker = markers.find((m) => m.id === id)
      if (marker) {
        toast.success(
          <div className="toast-content">
            <div>
              Moved Marker: <b>{marker.label}</b>
            </div>
            <div>
              to{' '}
              <b>
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
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
