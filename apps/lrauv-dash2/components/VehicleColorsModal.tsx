import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useVehicleColors } from './VehicleColorsContext'
import { Modal } from '@mbari/react-ui/src/Modal/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faEyeDropper } from '@fortawesome/free-solid-svg-icons'
import { SketchPicker } from 'react-color'
import { createLogger } from '@mbari/utils'
import { createPortal } from 'react-dom'

const logger = createLogger('VehicleColorsModal')

export interface VehicleColorsModalProps {
  isOpen: boolean
  onClose: () => void
  anchorPosition: { top: number; left: number }
  trackedVehicles?: string[]
  activeVehicle?: string
  forceShowAll?: boolean
}

export const VehicleColorsModal: React.FC<VehicleColorsModalProps> = ({
  isOpen,
  onClose,
  anchorPosition,
  trackedVehicles = [],
  activeVehicle,
  forceShowAll = false,
}) => {
  const {
    vehicleColors,
    setVehicleColor,
    resetVehicleColor,
    resetAllVehicleColors,
  } = useVehicleColors()
  const mapRef = React.useRef<any>(null)
  // Set initial state based on forceShowAll prop
  const [showAll, setShowAll] = useState(() => {
    // Use a function initializer to ensure it runs at the right time
    logger.debug('Initializing showAll with forceShowAll:', forceShowAll)
    return Boolean(forceShowAll)
  })

  const [editingColorFor, setEditingColorFor] = useState<string | null>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const presetColors = [
    '#FF0000',
    '#FFAA1D',
    '#FFFF00',
    '#90EE90',
    '#90D5FF',
    '#9F00C5',
    '#D7B492',
    '#FF007F',
    '#A1B0C6',
    '#66FF00',
    '#1974D2',
    '#08E8DE',
    '#5C62D6',
    '#BE398D',
    '#53BDA5',
  ]

  // Handle checkbox change
  const handleShowAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      logger.debug('Checkbox clicked', e.target.checked)
      e.stopPropagation()
      e.preventDefault() // Add this to prevent any default behavior
      setShowAll((prevState) => {
        logger.debug('Setting state from', prevState, 'to', !prevState)
        return !prevState // Toggle the state directly
      })
    },
    []
  )

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Get reference to the map when modal opens - Not working as expected
  useEffect(() => {
    if (isOpen) {
      // Find the Leaflet map instance
      const leafletContainer = document.querySelector('.leaflet-container')
      if (leafletContainer) {
        // Add a class that will disable interactions
        leafletContainer.classList.add('leaflet-disabled')

        // Try to find the map instance via _leaflet
        const map = (leafletContainer as any)._leaflet_map
        if (map) {
          mapRef.current = map
          map.dragging.disable()
          map.touchZoom.disable()
          map.doubleClickZoom.disable()
          map.scrollWheelZoom.disable()
          map.boxZoom.disable()
          map.keyboard.disable()
        }
      }
    }
    return () => {
      // Re-enable map when modal closes
      const leafletContainer = document.querySelector('.leaflet-container')
      if (leafletContainer) {
        leafletContainer.classList.remove('leaflet-disabled')

        const map = mapRef.current || (leafletContainer as any)._leaflet_map
        if (map) {
          // Re-enable map interactions
          map.dragging.enable()
          map.touchZoom.enable()
          map.doubleClickZoom.enable()
          map.scrollWheelZoom.enable()
          map.boxZoom.enable()
          map.keyboard.enable()
        }
      }
    }
  }, [isOpen])

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingColorFor &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setEditingColorFor(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingColorFor])

  // Calculate which vehicles to show
  const vehicles = Object.keys(vehicleColors).sort((a, b) => a.localeCompare(b))
  // Create a merged tracked vehicles array that includes the active vehicle
  const effectiveTrackedVehicles = React.useMemo(() => {
    if (!activeVehicle) return trackedVehicles

    // Create a Set to avoid duplicates
    const vehicleSet = new Set([
      ...trackedVehicles.map((v) => v.toLowerCase()),
      activeVehicle.toLowerCase(),
    ])

    return Array.from(vehicleSet)
  }, [trackedVehicles, activeVehicle])

  // Replace trackedVehicles with effectiveTrackedVehicles in your existing logic
  const normalizedTrackedVehicles = effectiveTrackedVehicles.map((v) =>
    v.toLowerCase()
  )

  // Filter vehicles based on showAll and tracked vehicles
  const visibleVehicles = React.useMemo(() => {
    if (!showAll && activeVehicle) {
      // If we're not showing all but have an active vehicle, ALWAYS include it
      return [activeVehicle]
    }
    // Start with all vehicles if showAll is true
    let baseVehicles = showAll ? vehicles : []

    // If not showing all, filter by tracked vehicles
    if (!showAll) {
      baseVehicles = vehicles.filter((vehicle) =>
        normalizedTrackedVehicles.includes(vehicle.toLowerCase())
      )
    }

    // ALWAYS ensure the active vehicle is included
    if (activeVehicle) {
      const matchingVehicle = vehicles.find(
        (v) => v.toLowerCase() === activeVehicle.toLowerCase()
      )

      if (matchingVehicle && !baseVehicles.includes(matchingVehicle)) {
        baseVehicles.push(matchingVehicle)
      } else if (!matchingVehicle && activeVehicle) {
        // If for some reason the vehicle isn't in our list, add it directly
        baseVehicles.push(activeVehicle)
      }
    }

    return baseVehicles
  }, [vehicles, showAll, normalizedTrackedVehicles, activeVehicle])

  // Effect to update showAll when forceShowAll changes
  useEffect(() => {
    if (forceShowAll) {
      logger.debug('Forcing show all vehicles')
      setShowAll(true)
    }
  }, [forceShowAll])

  // Debug logging to verify prop is received correctly
  useEffect(() => {
    if (isOpen) {
      // Reset all necessary state when modal opens
      if (forceShowAll) {
        logger.debug(
          'Modal opened - resetting showAll to true due to forceShowAll'
        )
        setShowAll(true)
      }
      // Reset other state if needed
      setEditingColorFor(null)
    }
  }, [isOpen, forceShowAll])

  // Debug what's coming in
  useEffect(() => {
    if (isOpen) {
      logger.debug('VehicleColorsModal opened with:', {
        trackedVehicles,
        activeVehicle,
        vehiclesInContext: Object.keys(vehicleColors),
        showAll,
        forceShowAll,
      })
    }
  }, [
    isOpen,
    trackedVehicles,
    activeVehicle,
    vehicleColors,
    showAll,
    forceShowAll,
  ])
  // Inside the component before the return statement
  useEffect(() => {
    // Ensure the active vehicle has a color entry
    if (activeVehicle && !vehicleColors[activeVehicle.toLowerCase()]) {
      logger.debug(`Adding missing color for ${activeVehicle}`)
      setVehicleColor(activeVehicle, '#666666')
    }
  }, [activeVehicle, vehicleColors, setVehicleColor])

  // For some reason, the map interactions are not being blocked as expected
  useEffect(() => {
    if (isOpen) {
      // Create a global event blocker
      const blockMapInteractions = (e: Event) => {
        // First check if target is the color picker or its children
        const target = e.target as Element
        const colorPicker = document.querySelector('.sketch-picker')
        const colorPickerContainer = document.querySelector(
          '.color-picker-container'
        )

        // Allow all events on the color picker
        if (
          (colorPicker && colorPicker.contains(target)) ||
          (colorPickerContainer && colorPickerContainer.contains(target))
        ) {
          return true // Allow events on the color picker
        }

        // Handle wheel events
        if (e.type === 'wheel') {
          const wheelEvent = e as WheelEvent
          const scrollableList = document.querySelector('.custom-scrollbar')

          // Allow wheel events only on the scrollable list
          if (scrollableList && scrollableList.contains(target)) {
            // Check boundaries
            const list = scrollableList as HTMLElement

            if (
              (list.scrollTop === 0 && wheelEvent.deltaY < 0) ||
              (list.scrollTop + list.clientHeight >= list.scrollHeight &&
                wheelEvent.deltaY > 0)
            ) {
              e.preventDefault()
              return false
            }

            // Allow normal scrolling within the list
            return true
          }
          e.preventDefault()
          e.stopPropagation()
          return false
        }

        // For other events, check if inside modal content
        const modalElement = document.querySelector('.vehicle-colors-content')
        const modalContainer = document.querySelector('.modal-container')

        if (
          (modalElement && modalElement.contains(target)) ||
          (modalContainer && modalContainer.contains(target))
        ) {
          return true // Allow events inside the modal
        }

        // Block everything else
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      const blockDoubleClick = (e: MouseEvent) => {
        const target = e.target as Element
        const modalContent = document.querySelector('.vehicle-colors-content')
        const colorPicker = document.querySelector('.sketch-picker')
        const colorPickerContainer = document.querySelector(
          '.color-picker-container'
        )

        // Allow double-clicks inside modal or color picker
        if (
          (modalContent && modalContent.contains(target)) ||
          (colorPicker && colorPicker.contains(target)) ||
          (colorPickerContainer && colorPickerContainer.contains(target))
        ) {
          return true
        }

        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Add event listeners
      window.addEventListener('mousedown', blockMapInteractions, true)
      window.addEventListener('mousemove', blockMapInteractions, true)
      window.addEventListener('mouseup', blockMapInteractions, true)
      window.addEventListener('dblclick', blockDoubleClick, true)
      window.addEventListener('wheel', blockMapInteractions, {
        capture: true,
        passive: false,
      })
      window.addEventListener('touchstart', blockMapInteractions, {
        capture: true,
        passive: false,
      })
      window.addEventListener('touchmove', blockMapInteractions, {
        capture: true,
        passive: false,
      })
      window.addEventListener('touchend', blockMapInteractions, true)

      // Disable map container
      // document.querySelectorAll('.leaflet-container').forEach((container) => {
      //   container.setAttribute(
      //     'style',
      //     'pointer-events: none !important; user-select: none !important;'
      //   )
      // })

      return () => {
        // Clean up all event listeners
        window.removeEventListener('mousedown', blockMapInteractions, true)
        window.removeEventListener('mousemove', blockMapInteractions, true)
        window.removeEventListener('mouseup', blockMapInteractions, true)
        window.removeEventListener('dblclick', blockDoubleClick, true)
        window.removeEventListener('wheel', blockMapInteractions, true)
        window.removeEventListener('touchstart', blockMapInteractions, true)
        window.removeEventListener('touchmove', blockMapInteractions, true)
        window.removeEventListener('touchend', blockMapInteractions, true)

        // Remove inline styles
        document.querySelectorAll('.leaflet-container').forEach((container) => {
          container.removeAttribute('style')
        })
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <Modal
        title={
          <div>
            <div className="md text-align-center font-italic bg-white text-sm text-gray-400">
              <i>Click on the Vehicle Hex Color to change.</i>
              <br />
            </div>
            <div className="py-4 text-left">
              <div
                className="vehicleColors bg-white text-lg font-bold underline"
                style={{
                  padding: '8px 0',
                  lineHeight: '3',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'left',
                  justifyContent: 'left',
                }}
              >
                VEHICLE COLORS
              </div>
            </div>
            <hr
              className="hr-round"
              style={{
                height: '1pt',
                width: '115%',
                background: '#ccc',
                marginLeft: '-5px',
              }}
            ></hr>
            {/* Show All Vehicles - as a standalone row with blue background */}
            <div
              className="flex items-center justify-between px-4 py-2"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '115%',
                marginLeft: '-5px',
                borderLeft: '1px solid #ccc',
                borderRight: '1px solid #ccc',
                background: '#e3f2fd',
                paddingBottom: '20px',
                paddingTop: '20px', // Match modal padding
              }}
            >
              <div className="flex items-center">
                <input
                  id="show-all-checkbox"
                  type="checkbox"
                  className="h-6 w-6 cursor-pointer"
                  checked={showAll}
                  onChange={handleShowAll}
                  onClick={(e) => {
                    e.stopPropagation()
                    logger.debug('Checkbox clicked via onClick')
                    setShowAll(!showAll)
                  }}
                />
                <label
                  htmlFor="show-all-checkbox"
                  className="ml-2 cursor-pointer text-lg font-medium text-black"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAll(!showAll)
                  }}
                >
                  Show all vehicles
                </label>
              </div>
              <button
                id="reset-all-vehicle-colors"
                onClick={resetAllVehicleColors}
                aria-label="Reset all vehicle colors"
                className="rounded bg-gray-400 px-4 py-2 text-lg font-medium text-white shadow-sm transition-colors hover:bg-blue-800"
              >
                Reset all
              </button>
            </div>
            <hr
              className="hr-round"
              style={{
                height: '1pt',
                width: '115%',
                background: '#ccc',
                marginLeft: '-5px',
              }}
            ></hr>
            <div
              className="vehicle-colors-content flex-grow"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.stopPropagation()
                e.preventDefault() // This is critical for wheel events
              }}
            ></div>
          </div>
        }
        confirmButtonText="Close"
        onClose={onClose}
        snapTo="top-left"
        open
        onConfirm={handleClose}
        draggable={false}
        allowPointerEventsOnChildren={false}
        bodyOverflowHidden={false}
        style={{
          top: anchorPosition?.top || 50,
          left: anchorPosition?.left || 50,
          background: 'bg-white !important',
          color: 'black',
          width: '480px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          position: 'relative',
        }}
      >
        <ul
          className="custom-scrollbar mb-2 flex flex-col overflow-auto"
          style={{
            minHeight: '100px', // Minimum height to avoid looking too small
            maxHeight: 'calc(70vh - 200px)', // Fixed height for scrollable area
            overflowY: 'auto',
            width: 'auto',
            background: '#fff',
            paddingBottom: '10px',
            paddingTop: '10px',
            paddingRight: '10px',
          }}
          onWheel={(e) => {
            e.stopPropagation()
            e.preventDefault = () => {} // Override preventDefault to enable scrolling
            return false
          }}
        >
          {visibleVehicles.map((vehicle) => (
            <div
              id={`vehicle-row-${vehicle}`}
              key={vehicle}
              className={`flex items-center justify-between border-b border-gray-200 py-2 ${
                vehicle.toLowerCase() === activeVehicle?.toLowerCase()
                  ? 'bg-blue-50' // Highlight the active vehicle
                  : ''
              }`}
            >
              {/* Vehicle name */}
              <div
                style={{
                  color: vehicleColors[vehicle],
                  width: '85px',
                  minWidth: '85px',
                  maxWidth: '85px',
                  position: 'relative',
                }}
                className="font-large group cursor-pointer truncate"
                title={`${vehicle}`}
              >
                {vehicle}
                {vehicle.toLowerCase() === activeVehicle?.toLowerCase() && (
                  <span className="ml-1 text-xs text-blue-600">(current)</span>
                )}
              </div>

              {/* Color picker button */}
              <div className="vehicle-hex-button relative w-1/2">
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent event from bubbling
                    setEditingColorFor(
                      editingColorFor === vehicle ? null : vehicle
                    )
                  }}
                  className="flex w-full items-center rounded border border-gray-300 bg-white px-3 py-1"
                >
                  <span
                    className="mr-2 inline-block h-4 w-4 rounded"
                    style={{ backgroundColor: vehicleColors[vehicle] }}
                  />
                  {vehicleColors[vehicle]}
                  <FontAwesomeIcon icon={faEyeDropper} className="ml-auto" />
                </button>

                {/* Color picker popup */}
                {editingColorFor === vehicle &&
                  createPortal(
                    <div
                      ref={colorPickerRef}
                      className="react-color-wrapper color-picker-container"
                      style={{
                        position: 'fixed',
                        zIndex: 2500, // Higher than modal's 2000
                        left: `${anchorPosition.left + 480 + 10}px`,
                        top: `${Math.max(
                          50,
                          Math.min(
                            window.innerHeight - 320,
                            document
                              .getElementById(`vehicle-row-${vehicle}`)
                              ?.getBoundingClientRect().top ||
                              anchorPosition.top
                          )
                        )}px`,
                        padding: '12px',
                        background: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        pointerEvents: 'auto', // Force this with !important
                        cursor: 'default !important', // Force this with !important
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Your existing button and color picker */}
                      <button
                        onClick={() => setEditingColorFor(null)}
                        aria-label="Close color picker"
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        style={{
                          zIndex: 2501,
                          cursor: 'pointer !important',
                          right: '12px',
                          left: 'auto',
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <div className="mb-2 font-medium">{vehicle} color</div>
                      <SketchPicker
                        color={vehicleColors[vehicle]}
                        onChangeComplete={(color: { hex: string }) =>
                          setVehicleColor(vehicle, color.hex.toUpperCase())
                        }
                        onChange={(color: { hex: string }) =>
                          setVehicleColor(vehicle, color.hex.toUpperCase())
                        }
                        disableAlpha
                        presetColors={presetColors}
                        styles={{
                          default: {
                            picker: {
                              width: '400px',
                              height: '450px',
                              cursor: 'default !important',
                              pointerEvents: 'auto',
                            },
                          },
                        }}
                      />
                    </div>,
                    document.body // Render directly to body, outside Modal
                  )}
              </div>
              {/* Reset button */}
              <button
                onClick={() => resetVehicleColor(vehicle)}
                className="ml-2 rounded border border-gray-300 bg-gray-200 px-3 py-1 transition-all duration-200 hover:border-gray-500 hover:bg-gray-300 hover:shadow-sm"
              >
                Reset
              </button>
            </div>
          ))}
        </ul>
      </Modal>
    </>
  )
}

export default VehicleColorsModal
