import { useRef, useState, useEffect, useCallback } from 'react'
import { Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { divIcon } from 'leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLocationDot,
  faTrashCan,
  faEdit,
  faClose,
  faPalette,
  faStar,
  faFlag,
} from '@fortawesome/free-solid-svg-icons'
import { renderToString } from 'react-dom/server'
import toast from 'react-hot-toast'
import { useMarkers } from './MarkerContext'
import { createLogger } from '@mbari/utils'

const logger = createLogger('DraggableMarker')

// Define the DraggableMarkerProps interface
export interface DraggableMarkerProps {
  id: string
  position: [number, number]
  label: string
  index: number
  isSelected?: boolean
  draggable?: boolean
  onClick?: () => void
  onDragEnd?: (newPosition: [number, number]) => void
  onEdit?: (newLabel: string) => void
  onDelete?: () => void
  onColorChange?: (newColor: string) => void
  onEditStateChange?: (isEditing: boolean) => void
  iconName?: string
  iconColor?: string
  isNew?: boolean
  savedToLayer?: boolean
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
  id,
  position,
  label,
  index,
  isSelected = false,
  isNew = false,
  savedToLayer = false,
  onClick,
  onDragEnd,
  onEdit,
  onDelete,
  onColorChange,
  iconColor,
}) => {
  logger.debug('DraggableMarker rendering, savedToLayer:', savedToLayer)
  const markerRef = useRef<L.Marker>(null)
  const [editMode, setEditMode] = useState(false)
  const [inputValue, setInputValue] = useState(label)
  const [selectedColor, setSelectedColor] = useState(iconColor || '#FF0000')
  const [markerPosition, setMarkerPosition] =
    useState<[number, number]>(position)
  const [showColorOptions, setShowColorOptions] = useState(false)
  const icon = createMarkerIcon(selectedColor, isSelected, savedToLayer)
  const inputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<L.Popup>(null)
  const map = useMap()
  const { handleMarkerSave, saveMarkerToLayer, removeMarkerFromLayer } =
    useMarkers()
  const [, forceUpdate] = useState({})

  // Color options for the color picker
  const colorOptions = [
    '#E53935',
    '#D81B60',
    '#8E24AA',
    '#5E35B1',
    '#3949AB',
    '#1E88E5',
    '#039BE5',
    '#00ACC1',
    '#00897B',
    '#43A047',
    '#7CB342',
    '#C0CA33',
    '#FDD835',
    '#FFB300',
    '#FB8C00',
  ]

  // Create a custom marker icon using FontAwesome
  function createMarkerIcon(
    color: string,
    isSelected: boolean,
    savedToLayer: boolean
  ): L.DivIcon {
    // Pass savedToLayer as a parameter to ensure it's current

    const iconComponent = (
      <div className="relative">
        <FontAwesomeIcon
          icon={faLocationDot}
          size={isSelected ? '2xl' : '2xl'}
          style={{
            color: color,
            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))',
          }}
        />

        {savedToLayer && (
          <div className="absolute -top-2 -left-2">
            <FontAwesomeIcon
              icon={faStar}
              size="sm"
              style={{
                color: '#FFD700',
                filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.7))',
              }}
            />
          </div>
        )}
      </div>
    )

    // Convert to HTML
    const iconHtml = renderToString(iconComponent)

    // Create the divIcon with appropriate sizing and anchor points
    return divIcon({
      className: `custom-marker-icon`,
      html: iconHtml,
      iconSize: [isSelected ? 38 : 36, isSelected ? 38 : 36],
      iconAnchor: [18, 36], // Center bottom of the marker
      popupAnchor: [0, -36], // Above the marker
      tooltipAnchor: [-5, -25],
    })
  }

  // Handle marker click
  const onEditStateChange = useCallback((isEditing: boolean) => {
    logger.debug(
      `Marker edit state changed: ${isEditing ? 'Editing' : 'Not Editing'}`
    )
  }, [])

  // Open the popup when the marker is clicked
  useEffect(() => {
    if (isNew) {
      logger.debug(`Opening popup for new marker ${id}...`)

      // First ensure the marker is mounted
      const marker = markerRef.current
      if (!marker) {
        logger.warn('Marker ref not available yet')
        return
      }

      // Use nested timeouts for proper sequencing
      setTimeout(() => {
        try {
          marker.openPopup()

          // Set edit mode after popup is open
          setEditMode(true)
          setShowColorOptions(false)

          // Focus the input field
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus()
              inputRef.current.select()
            } else {
              logger.warn('Input ref not available')
            }
          }, 100)
        } catch (err) {
          toast.error(`Error opening popup: ${(err as Error)?.message || err}`)
        }
      }, 100) // Slightly longer delay
    }
  }, [isNew, id])

  // Keep the popup open when editing
  useEffect(() => {
    // Get the marker's Leaflet instance
    const marker = markerRef.current
    if (!marker) return

    // If in edit mode, ensure popup is open
    if (editMode) {
      marker.openPopup()
    }
  }, [editMode])

  // Keep the popup open when selected
  useEffect(() => {
    if ((isNew || isSelected) && !editMode) {
      setEditMode(true)
      setShowColorOptions(false)
    }
  }, [isNew, isSelected, editMode])

  // Notify parent when edit mode changes
  useEffect(() => {
    if (onEditStateChange) {
      onEditStateChange(editMode)
    }
  }, [editMode, onEditStateChange])

  // Update position when props change
  useEffect(() => {
    setMarkerPosition(position)
  }, [position])

  // Update color when props change
  useEffect(() => {
    if (iconColor) {
      setSelectedColor(iconColor)
    }
  }, [iconColor])

  // Update input value when label changes
  useEffect(() => {
    if (editMode && inputRef.current) {
      // Focus the input and select all text
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 10) // Small timeout to ensure the input is rendered
    }
  }, [editMode])

  // Handle marker drag end
  const handleEditModeToggle = useCallback(
    (isEditing: boolean) => {
      setEditMode(isEditing)
      onEditStateChange?.(isEditing)
    },
    [onEditStateChange]
  )

  // Handle marker deletion
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      // Force remove the marker from the map immediately
      if (onDelete) {
        logger.debug(`Deleting marker ${id}`)
        onDelete()
      } else {
        logger.warn(`No onDelete handler for marker ${id}`)
      }

      // Close any open popup
      const marker = markerRef.current
      if (marker) {
        marker.closePopup()
      }
    },
    [onDelete, id]
  )

  // Handle marker drag end
  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current
    if (marker) {
      const newPosition = marker.getLatLng()
      setMarkerPosition([newPosition.lat, newPosition.lng])

      // Call the onDragEnd prop to update the position in parent state
      if (onDragEnd) {
        onDragEnd([newPosition.lat, newPosition.lng])
      }

      logger.debug(
        `Marker ${id} dragged to new position: [${newPosition.lat}, ${newPosition.lng}]`
      )
    }
  }, [id, onDragEnd])

  // Handle saving edits
  const handleSaveEdit = useCallback(() => {
    handleEditModeToggle(false)

    if (inputValue !== label && onEdit) {
      onEdit(inputValue)
    }

    if (selectedColor !== iconColor && onColorChange) {
      onColorChange(selectedColor)
    }

    handleMarkerSave(id, inputValue)
    setEditMode(false)
  }, [
    handleEditModeToggle,
    inputValue,
    label,
    onEdit,
    selectedColor,
    iconColor,
    onColorChange,
    handleMarkerSave,
    id,
  ])

  //  Handle toggling color options
  const handleToggleColorOptions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowColorOptions((prev) => !prev)
  }, [])

  // Handle canceling edits
  const handleCancelEdit = useCallback(() => {
    // If this is a new marker, show confirmation dialog
    if (isNew) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2 p-2">
            <div className="font-medium">Cancel editing and delete marker?</div>
            <div className="flex justify-between gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  onDelete?.() // Delete the marker
                  markerRef.current?.closePopup()
                }}
                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded bg-gray-300 px-3 py-1 text-black hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'top-center',
          id: 'cancel-edit',
          className: 'blue-toast',
        }
      )
    } else {
      // For existing markers, just close the popup
      handleEditModeToggle(false)
      setInputValue(label) // Reset to original value
      setSelectedColor(iconColor || '#FF0000') // Reset color
      markerRef.current?.closePopup()
    }
  }, [handleEditModeToggle, isNew, label, iconColor, onDelete])

  // Prevent popup from closing when clicking inside it
  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      // Stop popup from closing
      e.stopPropagation()
      e.preventDefault()

      // Open popup if not already open
      const marker = markerRef.current
      if (marker) {
        marker.openPopup()
      }

      // Hide color options by default when entering edit mode
      setShowColorOptions(false)
      handleEditModeToggle(true)
    },
    [handleEditModeToggle]
  )

  // Prevent default behavior for save/cancel
  const handleSaveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      handleSaveEdit()
    },
    [handleSaveEdit]
  )

  // Handle canceling edits
  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      logger.debug('Cancel button clicked')
      e.stopPropagation()
      e.preventDefault()
      handleCancelEdit()
    },
    [handleCancelEdit]
  )

  // Handle saving marker to layer
  const handleSaveToLayer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      logger.debug('Saving marker to layer, id:', id)
      saveMarkerToLayer(id.toString())
      // Increase timeout to give context time to update
      setTimeout(() => {
        logger.debug('Force updating after save, id:', id)
        forceUpdate({})
      }, 100)

      toast.success('Marker saved to Map Layers', {
        duration: 2000,
        position: 'top-center',
        className: 'blue-toast',
      })
    },
    [id, saveMarkerToLayer]
  )
  // Handle removing marker from layer
  const handleRemoveFromLayer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      logger.debug('Removing marker from layer, id:', id)
      removeMarkerFromLayer(id.toString())
      // Force re-render
      setTimeout(() => forceUpdate({}), 10)
      toast.success('Marker removed from Map Layers', {
        duration: 2000,
        position: 'top-center',
        className: 'blue-toast',
      })
    },
    [id, removeMarkerFromLayer]
  )

  //  Handle closing the popup
  const handleClosePopup = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Get the marker's Leaflet instance and close its popup
    const marker = markerRef.current
    if (marker) {
      marker.closePopup()
    }
  }, [])

  return (
    <Marker
      ref={markerRef}
      position={markerPosition}
      draggable={true}
      icon={icon}
      eventHandlers={{
        dragend: () => {
          handleDragEnd()
        },
        click: () => onClick?.(),
      }}
    >
      <Tooltip direction="top" offset={[-3, -10]} opacity={0.75}>
        {label}
      </Tooltip>
      {/* Render the popup only if the marker is selected */}
      <Popup
        ref={popupRef}
        closeOnClick={!editMode}
        autoClose={!editMode}
        className="marker-popup-container"
      >
        <div className="flex flex-col gap-0">
          <p className="m-0 p-0">
            <strong className="flex items-center">
              <span
                className="mr-2 h-4 w-4 flex-shrink-0 rounded-full"
                style={{ backgroundColor: selectedColor }}
                title={selectedColor}
              />
              {editMode ? (
                <input
                  ref={inputRef}
                  type="text"
                  title="Edit marker label"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="h-6 w-full border px-2 py-0 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex h-6 items-center">{label}</span>
              )}
            </strong>
            <br />
            <div
              className="marker-popup mt-1 text-sm text-gray-600"
              title="Marker position"
              style={{
                background: '#e3f2fd',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              <strong>Position:</strong>
              <br />
              &nbsp;&nbsp;{markerPosition[0].toFixed(5)},{' '}
              {markerPosition[1].toFixed(5)}
            </div>
          </p>

          <div className={`mt-1 flex h-8 justify-between gap-0`}>
            {editMode ? (
              <>
                <button
                  onClick={handleCancelClick}
                  className="rounded bg-gray-300 px-2 py-1 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleColorOptions}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                  title={
                    showColorOptions
                      ? 'Hide marker colors'
                      : 'Edit marker colors'
                  }
                >
                  <FontAwesomeIcon icon={faPalette} size="lg" />
                </button>
                <button
                  onClick={handleSaveClick}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                  title="Delete marker"
                >
                  <FontAwesomeIcon icon={faTrashCan} size="lg" />
                </button>

                {!savedToLayer ? (
                  <button
                    onClick={handleSaveToLayer}
                    className="relative rounded bg-green-500 px-2 py-1 text-xs text-white"
                    title="Save to Map Layers"
                  >
                    <FontAwesomeIcon
                      icon={faFlag} // Use regular star if available
                      style={{ color: '#FFFFFF' }}
                      size="lg"
                    />
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveFromLayer}
                    className="relative rounded bg-white px-2 py-1 text-xs text-black"
                    style={{
                      borderWidth: '1px',
                      borderColor: '#3b82f6',
                      borderStyle: 'solid',
                    }}
                    title="Remove from Map Layers"
                  >
                    <FontAwesomeIcon
                      icon={faStar}
                      style={{ color: '#FFD700' }} // Gold color
                      size="lg"
                    />
                  </button>
                )}

                <button
                  onClick={handleEditClick}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                  title="Edit marker"
                >
                  <FontAwesomeIcon icon={faEdit} size="lg" />
                </button>
                <button
                  onClick={handleClosePopup}
                  className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                  title="Close"
                >
                  <FontAwesomeIcon icon={faClose} size="lg" />
                </button>
              </>
            )}
          </div>

          {editMode && showColorOptions && (
            <div className="color-options-container mt-2">
              <p className="mb-1 text-xs font-semibold">Marker Color:</p>
              <div className="flex flex-wrap gap-0">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title="Select color"
                    className={`h-6 w-6 rounded-full ${
                      selectedColor === color
                        ? 'ring-2 ring-black ring-offset-1'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setSelectedColor(color)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

export default DraggableMarker
