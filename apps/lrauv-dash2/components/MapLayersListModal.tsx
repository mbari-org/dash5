import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import Tippy from '@tippyjs/react'
import { useStations } from '@mbari/api-client'
import { Modal } from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faCaretDown,
  faCaretRight,
  faMapMarkerAlt,
  faCircle,
  faStar,
  faArrowsToCircle,
} from '@fortawesome/free-solid-svg-icons'
import { useSelectedStations } from './SelectedStationContext'
import { useMarkers } from './MarkerContext'
import { createLogger } from '@mbari/utils'

const logger = createLogger('MapLayersListModal')

type SectionName = 'stations' | 'markers' | `station-${string}`

// TreeItem component for the tree structure
interface TreeItemProps {
  label: string
  isExpanded?: boolean
  isChecked?: boolean
  onToggleExpand?: () => void
  onToggleCheck?: () => void
  icon?: IconProp
  iconColor?: string
  children?: React.ReactNode
  disabled?: boolean
  isStarred?: boolean
  onStarClick?: () => void
  onMouseEnterStar?: () => void
  onMouseLeaveStar?: () => void
  onCenterClick?: () => void
}

const TreeItem: React.FC<TreeItemProps> = ({
  label,
  isExpanded = true,
  isChecked = false,
  onToggleExpand,
  onToggleCheck,
  icon,
  iconColor,
  children,
  disabled = false,
  isStarred,
  onStarClick,
  onMouseEnterStar,
  onMouseLeaveStar,
  onCenterClick,
}) => {
  const hasChildren = React.Children.count(children) > 0

  const CustomCircleIcon = () => (
    <div
      className="mr-2 inline-block"
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#e3f2fd',
        border: '4px solid #FFD700', // Yellow border
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    />
  )

  return (
    <div className="tree-item">
      <div className="flex items-center py-2 pl-2">
        {hasChildren ? (
          <button
            onClick={onToggleExpand}
            className="mr-1 text-gray-600 hover:text-blue-600 focus:outline-none"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <FontAwesomeIcon
              icon={isExpanded ? faCaretDown : faCaretRight}
              size="sm"
            />
          </button>
        ) : (
          <div className="tree-connector-wrapper ml-4 flex items-center">
            <span
              className="tree-connector"
              style={{
                display: 'inline-block',
                width: '24px',
                height: '2px',
                backgroundColor: '#999',
                marginLeft: '-35px',
                marginRight: '8px',
              }}
            ></span>
          </div>
        )}

        <label
          className={`flex w-full ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          } items-center`}
          title={disabled ? 'No valid coordinates' : undefined}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggleCheck}
            disabled={disabled}
            className="mapLayersCheckbox mr-2"
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#3182ce',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          {icon ? (
            icon === faCircle && iconColor === 'white' ? (
              <CustomCircleIcon />
            ) : (
              <FontAwesomeIcon
                icon={icon}
                className="mr-2"
                style={{
                  color: iconColor || undefined,
                }}
              />
            )
          ) : null}
          {onStarClick !== undefined && (
            <Tippy
              content={
                isStarred
                  ? 'Hover to spotlight on map'
                  : 'Click to enable spotlight'
              }
              placement="top-start"
              appendTo="parent"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onStarClick()
                }}
                onMouseEnter={onMouseEnterStar}
                onMouseLeave={onMouseLeaveStar}
                className="mr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label={isStarred ? 'Unstar station' : 'Star station'}
                aria-pressed={isStarred}
                style={{
                  width: '22px',
                  height: '22px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: '#fff',
                  border: 0,
                  padding: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon
                  icon={faStar}
                  style={{
                    color: isStarred ? '#FFD700' : '#9ca3af',
                    fontSize: '14px',
                  }}
                />
              </button>
            </Tippy>
          )}
          <span className="text-sm font-medium">{label}</span>
          {onCenterClick !== undefined && (
            <Tippy
              content="Center map on this station"
              placement="top-start"
              appendTo="parent"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCenterClick()
                }}
                className="ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label="Center map on station"
                style={{
                  width: '20px',
                  height: '20px',
                  flexShrink: 0,
                  borderRadius: '3px',
                  background: '#fff',
                  border: 0,
                  padding: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon
                  icon={faArrowsToCircle}
                  style={{ color: '#6b7280', fontSize: '14.5px' }}
                />
              </button>
            </Tippy>
          )}
        </label>
      </div>

      {isExpanded && hasChildren && (
        // This creates the vertical line connecting all children
        <div
          className="children-container"
          style={{
            marginLeft: '10px',
            paddingLeft: '12px',
            borderLeft: '2px solid #999',
            position: 'relative',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export const MapLayersListModal: React.FC<{
  onClose: () => void
  anchorPosition?: { top: number; left: number }
}> = ({ onClose, anchorPosition }) => {
  // Move all hooks to the top level
  const { data: stations } = useStations()
  const {
    selectedStations,
    setSelectedStations,
    starredStations,
    toggleStarStation,
    setHighlightedStationName,
    setFlyToRequest,
  } = useSelectedStations()
  const {
    markers,
    selectedMarkers,
    toggleMarkerVisibility,
    selectAllMarkers, // Make sure these are imported
    deselectAllMarkers,
  } = useMarkers()
  // Track expansion state of tree nodes
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionName, boolean>
  >({
    stations: false,
    markers: false,
    // Individual station groups can be added as needed
  })
  const [modalPosition, setModalPosition] = useState<
    { top: number; left: number } | undefined
  >(anchorPosition)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  // Separate ref for the dialog content element — used for getBoundingClientRect
  // measurements. modalRef wraps the fixed-position overlay and would report 0x0;
  // dialogRef points to the actual sized panel inside so position clamping works.
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref mirror so event-handler closures always read the latest fading state.
  const isFadingOutRef = useRef(false)
  // Set to true by the closing mousedown so the paired click from the SAME
  // gesture is still consumed (preventing map click-actions on close), then
  // cleared. Subsequent gestures during the fade pass through freely.
  const justClosedRef = useRef(false)

  const handleClose = useCallback(() => {
    if (isFadingOutRef.current) return
    isFadingOutRef.current = true
    setIsFadingOut(true)
    setHighlightedStationName(null)
    closeTimerRef.current = setTimeout(() => {
      onClose()
    }, 250)
  }, [onClose, setHighlightedStationName])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // Click-outside to dismiss
  useEffect(() => {
    const handleOutsideCapture = (e: MouseEvent) => {
      // The mousedown from the closing gesture set justClosedRef. Consume this
      // paired click to prevent map click-actions, then clear the flag so all
      // subsequent clicks during the fade pass through to the map.
      if (justClosedRef.current) {
        justClosedRef.current = false
        e.preventDefault()
        e.stopPropagation()
        return
      }
      // Already fading from a prior gesture — let events through so the map
      // is fully interactive during the 250 ms fade window.
      if (isFadingOutRef.current) return
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        e.preventDefault()
        e.stopPropagation()
        handleClose()
      }
    }

    const handleOutsideMouseDown = (e: MouseEvent) => {
      // Already fading — let all subsequent gestures reach the map.
      if (isFadingOutRef.current) return
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        // Don't stop propagation here so Leaflet can begin a pan/drag on the
        // same gesture. Flag the paired click so IT gets consumed instead.
        // Clear via mouseup (gesture end) rather than a fixed timeout so we
        // don't miss long-press or delayed-click scenarios.
        justClosedRef.current = true
        const clearJustClosed = () => {
          justClosedRef.current = false
          document.removeEventListener('mouseup', clearJustClosed, true)
        }
        document.addEventListener('mouseup', clearJustClosed, true)
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideMouseDown, {
      capture: true,
    })
    document.addEventListener('click', handleOutsideCapture, { capture: true })
    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown, {
        capture: true,
      })
      document.removeEventListener('click', handleOutsideCapture, {
        capture: true,
      })
    }
  }, [handleClose])

  useEffect(() => {
    if (!anchorPosition || !dialogRef.current) return

    const modalRect = dialogRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    let { top, left } = anchorPosition

    // Adjust vertical position if needed
    if (top + modalRect.height > viewportHeight) {
      top = Math.max(10, viewportHeight - modalRect.height - 10) // Keep 10px padding
    }

    // Adjust horizontal position if needed
    if (left + modalRect.width > viewportWidth) {
      left = Math.max(10, viewportWidth - modalRect.width - 10)
    }

    setModalPosition({ top, left })
  }, [anchorPosition])

  const toggleExpanded = useCallback((section: SectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  // Existing handlers for stations
  const handleSelectAllStations = useCallback(() => {
    if (stations) {
      setSelectedStations(
        stations.map((station) => ({
          name: station.name,
          geojson: station.geojson,
          lat: station.geojson.geometry.coordinates[1],
          lon: station.geojson.geometry.coordinates[0],
        }))
      )
    }
  }, [stations, setSelectedStations])

  // Deselect all stations
  const handleDeselectAllStations = useCallback(() => {
    setSelectedStations([])
  }, [setSelectedStations])

  // Toggle select all stations
  const handleToggleSelectAllStations = useCallback(() => {
    if (selectedStations.length === stations?.length) {
      handleDeselectAllStations()
    } else {
      handleSelectAllStations()
    }
  }, [
    selectedStations,
    stations,
    handleSelectAllStations,
    handleDeselectAllStations,
  ])
  // Filter markers to only show those saved to layer
  const layerMarkers = useMemo(
    () => markers.filter((marker) => marker.savedToLayer),
    [markers]
  )
  // Handle Toggle Select All Markers
  const handleToggleSelectAllMarkers = useCallback(() => {
    // Check if all markers are currently visible
    const allVisible = layerMarkers.every((marker) => marker.visible !== false)

    // Toggle visibility for all markers one by one
    layerMarkers.forEach((marker) => {
      // Only toggle if needed to achieve the desired state
      const needsToggle = (marker.visible !== false) === allVisible
      if (needsToggle) {
        toggleMarkerVisibility(marker.id.toString())
      }
    })

    // Also update selection state to keep it in sync
    if (allVisible) {
      deselectAllMarkers()
    } else {
      selectAllMarkers()
    }
  }, [
    layerMarkers,
    toggleMarkerVisibility,
    selectAllMarkers,
    deselectAllMarkers,
  ])

  // Check if a station is selected
  const isStationSelected = (stationName: string): boolean => {
    return selectedStations.some((s) => s.name === stationName)
  }

  // Memoized starred Set and sorted station list to avoid repeated .includes()
  // calls inside the sort comparator on every render.
  const starredSet = useMemo(
    () => new Set(starredStations ?? []),
    [starredStations]
  )
  const sortedStations = useMemo(() => {
    const list = stations ?? []
    // Decorate with original index so unstarred stations always preserve
    // API order regardless of JS engine sort stability guarantees.
    return list
      .map((station, index) => ({ station, index }))
      .sort((a, b) => {
        const aStarred = starredSet.has(a.station.name)
        const bStarred = starredSet.has(b.station.name)
        if (aStarred && bStarred)
          return a.station.name.localeCompare(b.station.name)
        if (aStarred) return -1
        if (bStarred) return 1
        // Both unstarred: preserve original API order
        return a.index - b.index
      })
      .map(({ station }) => station)
  }, [stations, starredSet])

  return (
    <>
      <div ref={modalRef}>
        <Modal
          title={
            <div>
              <div className="md text-align-center font-italic bg-white text-sm text-gray-400">
                <i>Select the map layers to display</i>
                <br />
                <br />
                <br />
              </div>
              <div className="flex items-center justify-between">
                <div className="stations text-align-center mb-2 bg-white text-lg font-bold underline">
                  MAP LAYERS
                </div>
              </div>
            </div>
          }
          onClose={handleClose}
          snapTo={!modalPosition ? 'top-left' : undefined}
          open
          allowPointerEventsOnChildren
          fullWidthBody={true}
          style={{
            maxHeight: '70vh',
            background: '#ffffff',
            color: 'blue',
            position: modalPosition ? 'fixed' : undefined,
            top: modalPosition ? `${modalPosition.top}px` : undefined,
            left: modalPosition ? `${modalPosition.left}px` : undefined,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            width: 'auto',
            minWidth: '350px',
            paddingBottom: '0px',
            paddingTop: '10px',
            opacity: isFadingOut ? 0 : 1,
            pointerEvents: isFadingOut ? 'none' : 'auto',
            transition: 'opacity 0.25s ease-out',
            marginBottom: '0px',
            marginTop: '0px',
          }}
          className="m-0 p-0"
        >
          {/* Invisible inner anchor for getBoundingClientRect — the outer
              wrapper div is position:fixed and may report 0x0 */}
          <div
            ref={dialogRef}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />
          <div
            className="custom-scrollbar flex-grow"
            style={{
              overflowY: 'auto',
              background: '#e3f2fd',
              padding: '10px',
              width: '100%',
              margin: '0px 0px 20px 0px',
              borderRadius: '4px',
              minHeight: '0',
              maxHeight: 'calc(70vh - 160px)',
            }}
          >
            {/* Main tree structure */}
            <div className="tree-view">
              {/* Markers Section */}
              <TreeItem
                label="Markers"
                isExpanded={expandedSections.markers}
                isChecked={
                  selectedMarkers.length === layerMarkers.length &&
                  layerMarkers.length > 0
                }
                onToggleExpand={() => toggleExpanded('markers')}
                onToggleCheck={
                  layerMarkers.length > 0
                    ? handleToggleSelectAllMarkers
                    : undefined
                }
                icon={faMapMarkerAlt}
                iconColor="red"
                disabled={layerMarkers.length === 0}
              >
                {layerMarkers.map((marker) => (
                  <TreeItem
                    key={`marker-${marker.id}`}
                    label={marker.label || `Marker ${marker.id}`}
                    isChecked={marker.visible !== false}
                    onToggleCheck={() =>
                      toggleMarkerVisibility(marker.id.toString())
                    }
                    icon={faMapMarkerAlt}
                    iconColor="red"
                  />
                ))}
                {layerMarkers.length === 0 && (
                  <div className="py-2 pl-10 text-sm italic text-gray-500">
                    No markers saved to layers
                  </div>
                )}
              </TreeItem>

              {/* Stations Section */}
              <TreeItem
                label="Stations"
                isExpanded={expandedSections.stations}
                isChecked={
                  selectedStations.length === stations?.length &&
                  stations?.length > 0
                }
                onToggleExpand={() => toggleExpanded('stations')}
                onToggleCheck={handleToggleSelectAllStations}
                icon={faCircle}
                iconColor="white"
              >
                {/* Starred stations first (alphabetical), then unstarred in original API order */}
                {sortedStations.map((station) => {
                  const coords = station.geojson?.geometry?.coordinates
                  const stationLon = coords?.[0]
                  const stationLat = coords?.[1]
                  const hasValidCoords =
                    Number.isFinite(stationLat as number) &&
                    Number.isFinite(stationLon as number)

                  return (
                    <TreeItem
                      key={`station-${station.name}`}
                      label={station.name}
                      disabled={!hasValidCoords}
                      isChecked={isStationSelected(station.name)}
                      onToggleCheck={() => {
                        if (isStationSelected(station.name)) {
                          setSelectedStations(
                            selectedStations.filter(
                              (s) => s.name !== station.name
                            )
                          )
                        } else if (hasValidCoords) {
                          setSelectedStations([
                            ...selectedStations,
                            {
                              name: station.name,
                              geojson: station.geojson,
                              lat: stationLat as number,
                              lon: stationLon as number,
                            },
                          ])
                        }
                      }}
                      isStarred={starredSet.has(station.name)}
                      onStarClick={() => {
                        const isCurrentlyStarred = starredSet.has(station.name)
                        if (isCurrentlyStarred) {
                          // Un-starring: clear any active spotlight
                          setHighlightedStationName(null)
                        } else {
                          // Starring while hovering: immediately show spotlight
                          // so the user doesn't need to mouse-out and back
                          setHighlightedStationName(station.name)
                        }
                        toggleStarStation(station.name)
                      }}
                      onMouseEnterStar={() => {
                        if (starredSet.has(station.name)) {
                          setHighlightedStationName(station.name)
                        }
                      }}
                      onMouseLeaveStar={() => setHighlightedStationName(null)}
                      onCenterClick={
                        hasValidCoords
                          ? () =>
                              setFlyToRequest({
                                lat: stationLat as number,
                                lon: stationLon as number,
                              })
                          : undefined
                      }
                    />
                  )
                })}
                {stations !== undefined && stations.length === 0 ? (
                  <div className="py-2 pl-10 text-sm italic text-gray-500">
                    No stations available
                  </div>
                ) : null}
              </TreeItem>
            </div>
          </div>
          {/* Footer placed inside the modal content */}
          <div
            className="border-t border-gray-200 bg-white"
            style={{
              padding: '8px 0',
              width: 'auto',
              background: '#e3f2fd',
              marginRight: '0px',
              marginLeft: '0px',
              marginBottom: '0',
              borderRadius: '4px',
              flexShrink: 0,
              height: '60px',
            }}
          >
            <div className="flex justify-end pr-3">
              <button
                onClick={handleClose}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-800"
                style={{
                  marginRight: '20px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
