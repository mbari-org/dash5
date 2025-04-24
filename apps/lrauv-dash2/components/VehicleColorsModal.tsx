import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useVehicleColors } from './VehicleColorsContext'
import { Modal } from '@mbari/react-ui/src/Modal/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faEyeDropper } from '@fortawesome/free-solid-svg-icons'
import { HexColorPicker } from 'react-colorful'
import { createLogger } from '@mbari/utils'

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
  // Set initial state based on forceShowAll prop
  const [showAll, setShowAll] = useState(() => {
    // Use a function initializer to ensure it runs at the right time
    logger.debug('Initializing showAll with forceShowAll:', forceShowAll)
    return Boolean(forceShowAll)
  })

  const [editingColorFor, setEditingColorFor] = useState<string | null>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

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

  if (!isOpen) return null

  return (
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
        </div>
      }
      confirmButtonText="Close"
      onClose={onClose}
      snapTo="top-left"
      open
      onConfirm={handleClose}
      style={{
        top: anchorPosition?.top || 50,
        left: anchorPosition?.left || 50,
        background: 'bg-white !important',
        color: 'black',
        width: '480px',
        maxWidth: '90vw',
        maxHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1600,
      }}
    >
      <div className="vehicle-colors-content">
        <div
          className="overflow-y-auto p-2"
          style={{ maxHeight: 'calc(90vh - 150px)' }}
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
              <div className="relative w-1/2">
                <button
                  onClick={() =>
                    setEditingColorFor(
                      editingColorFor === vehicle ? null : vehicle
                    )
                  }
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
                {editingColorFor === vehicle && (
                  <div
                    ref={colorPickerRef}
                    style={{
                      position: 'fixed',
                      zIndex: 2000,
                      // Position to the right of the modal
                      left: `${anchorPosition.left + 480 + 10}px`, // modal width (480) + gap (10)
                      // Align with the current vehicle row (using clientY from a ref)
                      top: `${Math.max(
                        50,
                        Math.min(
                          window.innerHeight - 320, // Keep within viewport
                          document
                            .getElementById(`vehicle-row-${vehicle}`)
                            ?.getBoundingClientRect().top || anchorPosition.top
                        )
                      )}px`,
                      padding: '12px',
                      background: 'white',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  >
                    <div className="mb-2 font-medium">{vehicle} color</div>
                    <HexColorPicker
                      color={vehicleColors[vehicle]}
                      onChange={(color) => setVehicleColor(vehicle, color)}
                    />
                  </div>
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
        </div>
      </div>
    </Modal>
  )
}

export default VehicleColorsModal
