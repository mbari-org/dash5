import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react'
import { useManagedWaypoints } from '@mbari/react-ui'
import useGoogleElevator from '../lib/useGoogleElevator'
import { VPosDetail } from '@mbari/api-client'
import { MapLayersListModal } from '../components/MapLayersListModal'
import { useSelectedStations } from './SelectedStationContext'
import { useMarkers } from './MarkerContext'
import { PlatformsListModal } from './PlatformsListModal'
import toast from 'react-hot-toast'
import { createLogger } from '@mbari/utils'
import VehicleColorsModal from './VehicleColorsModal'
import { MapRefreshButton } from './MapRefreshButton'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import { useRefreshPositions } from '../lib/useRefreshPositions'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})

const MapDepthDisplay = dynamic(
  () =>
    import('@mbari/react-ui/dist/Map/Map').then((m) => ({
      default: m.MapDepthDisplay,
    })),
  { ssr: false }
)
const DraggableMarker = dynamic(() => import('./DraggableMarker'), {
  ssr: false,
})
const ClickableMapPoint = dynamic(() => import('./ClickableMapPoint'), {
  ssr: false,
})
const VehiclePath = dynamic(() => import('./VehiclePath'), {
  ssr: false,
})
const WaypointPreviewPath = dynamic(() => import('./WaypointPreviewPath'), {
  ssr: false,
})
const WaypointMapMarker = dynamic(() => import('./WaypointMapMarker'), {
  ssr: false,
})
const StationMarker = dynamic(() => import('../components/StationMarker'), {
  ssr: false,
})
const MapClickHandler = dynamic(() => import('./MapClickHandler'), {
  ssr: false,
})
const CustomMarkerSet = dynamic(() => import('./CustomMarkerSet'), {
  ssr: false,
})
const MapFlyTo = dynamic(() => import('./MapFlyTo'), {
  ssr: false,
})
const PlatformPaths = dynamic(
  () =>
    import('./PlatformPaths').then((mod) => ({ default: mod.PlatformPaths })),
  {
    ssr: false,
  }
)

const logger = createLogger('DeploymentMap')
interface DeploymentMapProps {
  vehicleName?: string | null
  indicatorTime?: number | null
  onScrub?: (time?: number | null) => void
  startTime?: number | null
  endTime?: number | null
}

const DeploymentMap: React.FC<DeploymentMapProps> = ({
  vehicleName,
  indicatorTime,
  onScrub: handleScrub,
  startTime,
  endTime,
}) => {
  const router = useRouter()
  const mapRef = useRef<any>(null)
  const {
    updatedWaypoints,
    handleWaypointsUpdate,
    editable,
    focusedWaypointIndex,
  } = useManagedWaypoints()
  const handleDragEnd = useCallback(
    (index: number, { lat, lng }: { lat: number; lng: number }) => {
      const roundedLat = Number(lat.toFixed(5))
      const roundedLng = Number(lng.toFixed(5))
      return handleWaypointsUpdate(
        updatedWaypoints.map((m, i) =>
          i === index
            ? {
                ...m,
                lat: roundedLat.toString(),
                lon: roundedLng.toString(),
                stationName: 'Custom',
              }
            : m
        )
      )
    },
    [updatedWaypoints, handleWaypointsUpdate]
  )

  const handleDeleteWaypoint = useCallback(
    (index: number) =>
      handleWaypointsUpdate(
        updatedWaypoints.map((m, i) =>
          i === index
            ? { ...m, lat: 'NaN', lon: 'NaN', stationName: 'Custom' }
            : m
        )
      ),
    [updatedWaypoints, handleWaypointsUpdate]
  )

  const { handleDepthRequest } = useGoogleElevator()

  // Keep original indices so drag/delete updates target the correct waypoint
  // even when some waypoints are filtered out from map rendering.
  const plottedWaypoints = useMemo(
    () =>
      updatedWaypoints
        .map((waypoint, originalIndex) => ({ waypoint, originalIndex }))
        .filter(
          ({ waypoint }) =>
            !!waypoint.lat?.trim() &&
            !!waypoint.lon?.trim() &&
            ![
              waypoint.lat?.trim().toLowerCase(),
              waypoint.lon?.trim().toLowerCase(),
            ].includes('nan')
        ),
    [updatedWaypoints]
  )

  const { trackedVehicles } = useTrackedVehicles()
  const [showAll, setShowAll] = useState(true)

  const vehiclesToRefresh = vehicleName
    ? [vehicleName]
    : trackedVehicles.map((v) => (typeof v === 'string' ? v : v))
  const {
    refreshAll,
    lastRefreshed,
    loading: refreshLoading,
    markInitialLoadDone,
  } = useRefreshPositions(vehiclesToRefresh, {
    autoRefreshMinutes: 10,
    // Use vehicle's time range so toast counts match the map
    preferredParams:
      vehicleName && startTime != null
        ? { [vehicleName]: { from: startTime, to: endTime ?? undefined } }
        : undefined,
  })
  const [isTimelineScrubbing, setIsTimelineScrubbing] = useState(false)
  const [center, setCenter] = useState<undefined | [number, number]>()
  const [centerZoom, setCenterZoom] = useState<number | undefined>(undefined)
  const [bounds, setBounds] = useState<
    [[number, number], [number, number]] | undefined
  >()
  const [latestGPS, setLatestGPS] = useState<VPosDetail | undefined>()
  const [viewMode, setViewMode] = useState<'center' | 'bounds' | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [defaultMarkerColor, setDefaultMarkerColor] = useState<string>('red')
  const [showLayersModal, setShowLayersModal] = useState(false)
  const [showVehicleColors, setShowVehicleColors] = useState(false)
  const [showPlatformsModal, setShowPlatformsModal] = useState(false)
  const { selectedStations, highlightedStationName } = useSelectedStations()
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [waypointFitTrigger, setWaypointFitTrigger] = useState(0)
  const prevFocusedWaypointIndexRef = useRef<number | null | undefined>(
    undefined
  )
  const [colorModalPosition, setColorModalPosition] = useState<{
    top: number
    left: number
  }>({ top: 0, left: 0 })
  const [layersModalPosition, setLayersModalPosition] = useState({
    top: 0,
    left: 0,
  })

  const {
    markers,
    isAddingMarkers,
    setIsAddingMarkers,
    handleAddMarker,
    handleMarkerLabelChange,
    handleMarkerColorChange,
    handleMarkerDelete,
    handleMarkerDragEnd,
    handleToggleMarkerMode,
    handleMarkersRequest,
    activeEditMarkerId,
    setActiveEditMarkerId,
    setMarkers,
  } = useMarkers()

  const latestVehicle = useRef(vehicleName)
  useEffect(() => {
    if (vehicleName !== latestVehicle.current) {
      setLatestGPS(undefined)
      setCenter(undefined)
      latestVehicle.current = vehicleName
    }
  }, [vehicleName, setLatestGPS])

  // Bump fitTrigger when leaving waypoint focus mode so WaypointPreviewPath
  // re-fits bounds even when the route coordinates didn't change.
  useEffect(() => {
    const prev = prevFocusedWaypointIndexRef.current
    if (typeof prev === 'number' && focusedWaypointIndex == null) {
      setWaypointFitTrigger((n) => n + 1)
    }
    prevFocusedWaypointIndexRef.current = focusedWaypointIndex
  }, [focusedWaypointIndex])

  useEffect(() => {
    if (mapRef?.current && !showVehicleColors) {
      setTimeout(() => {
        try {
          // Try to invalidateSize method(s)
          if (typeof mapRef?.current.invalidateSize === 'function') {
            mapRef?.current.invalidateSize()
          } else if (
            mapRef?.current._leafletContainer &&
            typeof mapRef?.current._leafletContainer.invalidateSize ===
              'function'
          ) {
            mapRef?.current._leafletContainer.invalidateSize()
          } else if (
            mapRef?.current.leafletElement &&
            typeof mapRef?.current.leafletElement.invalidateSize === 'function'
          ) {
            mapRef?.current.leafletElement.invalidateSize()
          } else {
            // Log what we have for debugging
            logger.debug('Map structure:', mapRef?.current)
          }
        } catch (e) {
          logger.warn('Error invalidating map size:', e)
        }
      }, 200)
    }
  }, [showVehicleColors])
  // Store all vehicle locations to calculate center
  const vehiclePosition = useRef<Array<[number, number]>>([])
  // Vehicle path points for bounds calculation
  const pathPoints = useRef<Array<[number, number]>>([])

  // Handle map scrubbing event control
  const handleMapScrub = useCallback(
    (time?: number | null) => {
      setIsTimelineScrubbing(time !== null)
      handleScrub?.(time)
    },
    [handleScrub]
  )

  // Handle opening the color modal
  const handleOpenColorModal = () => {
    setColorModalOpen(true)
    setColorModalPosition({ top: 100, left: 100 }) // Adjust as needed
  }

  // Handler for GPS fix updates
  const handleGPSFix = useCallback(
    (gps: VPosDetail) => {
      // Reset the array if vehicle name changes
      if ((latestGPS?.isoTime ?? 0) > gps.isoTime || !latestGPS) {
        vehiclePosition.current = []
        setLatestGPS(gps)
      }
      // Store position for path bounds calculation
      if (gps?.latitude && gps?.longitude) {
        pathPoints.current.push([gps.latitude, gps.longitude])
      }
      // Limit stored positions to prevent memory issues
      if (pathPoints.current.length > 1000) {
        pathPoints.current = pathPoints.current.slice(-1000)
      }
      // Store position for centering
      const position: [number, number] = [gps.latitude, gps.longitude]
      vehiclePosition.current.push(position)
    },
    [latestGPS, setLatestGPS]
  )

  // Handle marker click event
  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setSelectedMarkerId((prevId) => (prevId === markerId ? null : markerId))

      // Close any open popups if a different marker is selected
      if (mapRef?.current && selectedMarkerId !== markerId) {
        try {
          // Try different ways to access closePopup
          if (typeof mapRef?.current.closePopup === 'function') {
            mapRef?.current.closePopup()
          } else if (
            mapRef?.current &&
            typeof mapRef?.current.closePopup === 'function'
          ) {
            // Some React wrappers use _leafletElement
            mapRef?.current.closePopup()
          } else if (mapRef?.current.getContainer) {
            // If we can access the container, try to find any open popups and close them manually
            const container = mapRef?.current.getContainer()
            const popups = container.querySelectorAll('.leaflet-popup')
            if (popups.length > 0) {
              logger.debug('Closing popups manually')
              // This will trigger Leaflet's internal popup close handlers
              document.body.click()
            }
          } else {
            logger.debug('No method to close popups found on map instance')
          }
        } catch (error) {
          logger.warn('Error closing popup:', error)
        }
      }
    },
    [selectedMarkerId]
  )

  // Handle marker edit request
  const handleEditMarker = useCallback(
    (markerId: string) => {
      // Set the active edit marker ID to trigger edit mode
      setActiveEditMarkerId(markerId)

      // Find the marker to edit
      const markerToEdit = markers.find((m) => m.id.toString() === markerId)
      if (markerToEdit) {
        logger.debug('Editing marker:', markerToEdit)
        // You could set additional state here if needed for editing UI
      }
    },
    [markers, setActiveEditMarkerId]
  )

  // Handle marker delete request
  const handleDeleteMarker = useCallback(
    (markerId: string) => {
      // Clear selection if the deleted marker was selected
      if (selectedMarkerId === markerId) {
        setSelectedMarkerId(null)
      }

      // Call the delete function from marker context
      handleMarkerDelete(markerId)

      toast.success('Marker deleted', {
        id: 'marker-deleted',
        duration: 2000,
        className: 'blue-toast',
      })
    },
    [handleMarkerDelete, selectedMarkerId]
  )

  // Handle marker save to layer
  const handleSaveMarkerToLayer = useCallback(
    (markerId: string, shouldSave: boolean = true) => {
      logger.debug(
        `${shouldSave ? 'Saving' : 'Removing'} marker ${markerId} ${
          shouldSave ? 'to' : 'from'
        } layer`
      )

      try {
        // Find the marker to update
        const markerToUpdate = markers.find(
          (marker) => marker.id.toString() === markerId
        )

        if (!markerToUpdate) {
          logger.warn(`Marker with ID ${markerId} not found`)
          toast.error('Could not find marker to update', {
            id: 'marker-layer-error',
            duration: 2000,
          })
          return
        }

        // Update marker in context
        const updatedMarkers = markers.map((marker) => {
          if (marker.id.toString() === markerId) {
            return {
              ...marker,
              savedToLayer: shouldSave,
              visible: shouldSave ? true : marker.visible, // Make visible by default when saving
            }
          }
          return marker
        })

        // Update the markers in context/state
        setMarkers(updatedMarkers)

        // If this was the selected marker, update UI state as needed
        if (selectedMarkerId === markerId && !shouldSave) {
          // Optionally deselect the marker if being removed from layer
          // setSelectedMarkerId(null);
        }

        // Save to localStorage - only markers marked as savedToLayer
        const layerMarkers = updatedMarkers.filter((m) => m.savedToLayer)

        try {
          localStorage.setItem(
            'lrauv-map-markers',
            JSON.stringify(layerMarkers)
          )
          logger.debug(`Saved ${layerMarkers.length} markers to localStorage`)
        } catch (storageError) {
          logger.error('Error saving markers to localStorage:', storageError)
          toast.error('Error saving markers', {
            id: 'marker-storage-error',
            duration: 3000,
          })
          // Continue execution - Markers are updated in-memory
        }

        // Provide user feedback
        toast.success(
          shouldSave
            ? `Marker "${markerToUpdate.label || 'Unnamed'}" saved to layer`
            : `Marker "${
                markerToUpdate.label || 'Unnamed'
              }" removed from layer`,
          {
            id: 'marker-layer-update',
            duration: 2000,
            className: 'blue-toast',
          }
        )

        // Trigger UI updates if needed
        if (shouldSave && mapRef?.current) {
          // This could optionally trigger a map UI update
        }
      } catch (error) {
        logger.error('Error in handleSaveMarkerToLayer:', error)
        toast.error('Failed to update marker', {
          id: 'marker-update-error',
          duration: 2000,
        })
      }
    },
    [markers, setMarkers, selectedMarkerId]
  )
  // Handle Marker position change
  const handleMarkerPositionChange = useCallback(
    (markerId: string, newPos: [number, number]) => {
      // Convert string ID to number
      const numericId = parseInt(markerId, 10)

      // Convert position array to expected object format
      const positionObj = {
        lat: newPos[0],
        lng: newPos[1],
      }

      // Call the actual handler with properly formatted parameters
      handleMarkerDragEnd(numericId, positionObj)
    },
    [handleMarkerDragEnd]
  )

  // Calculate bounds for the path
  const calculatePathBounds = useCallback(() => {
    if (pathPoints.current.length === 0) {
      toast('No path points available for bounds calculation')
      return
    }

    // Find min/max lat/lon
    let minLat = 90,
      maxLat = -90,
      minLng = 180,
      maxLng = -180

    pathPoints.current.forEach((pos) => {
      minLat = Math.min(minLat, pos[0])
      maxLat = Math.max(maxLat, pos[0])
      minLng = Math.min(minLng, pos[1])
      maxLng = Math.max(maxLng, pos[1])
    })

    // Add padding (0.05 degrees)
    const padding = 0.05
    const newBounds: [[number, number], [number, number]] = [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding],
    ]

    setBounds(newBounds)
    setCenter(undefined) // Clear center when using bounds
    // Force a re-render to update the map
    setViewMode('bounds')
  }, [])

  // Handler for centering the map on the latest GPS fix
  const handleCoordinateRequest = useCallback(() => {
    if (latestGPS) {
      setCenter([latestGPS.latitude, latestGPS.longitude])
      setCenterZoom(17)
      setBounds(undefined)
      setViewMode('center')
    } else {
      // If no latestGPS, try to use the last point in pathPoints
      const lastPoint = pathPoints.current[pathPoints.current.length - 1]
      if (lastPoint) {
        setCenter(lastPoint)
        setCenterZoom(17)
        setBounds(undefined)
        setViewMode('center')
      } else {
        toast('DeploymentMap - No position available to center on')
      }
    }
  }, [latestGPS])

  // Handler for fitting bounds to entire path
  const handleFitBoundsRequest = useCallback(() => {
    calculatePathBounds()
  }, [calculatePathBounds])

  // Handler for showing Marker and Station layers
  const handleLayersRequest = useCallback(
    (position?: { top: number; left: number }) => {
      if (position) {
        setLayersModalPosition(position)
      }
      setShowLayersModal(true)
    },
    []
  )

  // Handler for closing the layers modal
  const handleCloseLayers = useCallback(() => {
    setShowLayersModal(false)
  }, [])

  const handleVehicleColorRequest = useCallback(
    (anchor?: { top: number; left: number }) => {
      if (anchor) {
        setColorModalPosition(anchor)
      } else {
        setColorModalPosition({ top: 100, left: 100 })
      }
      setColorModalOpen(true)
    },
    []
  )

  const handleCloseVehicleColors = useCallback((vehicleName?: string) => {
    setShowVehicleColors(false)

    // Time for map to adjust after modal closes
    setTimeout(() => {
      if (mapRef?.current) {
        try {
          // Try invalidateSize method(s)
          if (typeof mapRef?.current.invalidateSize === 'function') {
            mapRef?.current.invalidateSize()
          } else if (
            mapRef?.current._leafletContainer &&
            typeof mapRef?.current._leafletContainer.invalidateSize ===
              'function'
          ) {
            mapRef?.current._leafletContainer.invalidateSize()
          } else {
            // Log for debugging
            logger.debug('Map reference type:', typeof mapRef?.current)
            logger.debug(
              'Map reference properties:',
              Object.keys(mapRef?.current)
            )
          }
          logger.debug('Map size invalidated after closing modal')
        } catch (e) {
          logger.warn('Error invalidating map size:', e)
        }
      }
    }, 300) // Slightly longer timeout for modal animation to complete
  }, [])

  const handlePlatformsRequest = useCallback(() => {
    setShowPlatformsModal(true)
  }, [])

  const handleClosePlatforms = useCallback(() => {
    setShowPlatformsModal(false)
  }, [])

  const modalTrackedVehicles = React.useMemo(() => {
    if (!vehicleName) return trackedVehicles

    // Create a new array with the current vehicle
    return Array.from(new Set([...trackedVehicles, vehicleName]))
  }, [trackedVehicles, vehicleName])

  return (
    <div className="h-full min-h-0 w-full">
      {showLayersModal ? (
        <MapLayersListModal
          onClose={handleCloseLayers}
          anchorPosition={layersModalPosition}
        />
      ) : null}
      {showPlatformsModal ? (
        <PlatformsListModal onClose={handleClosePlatforms} />
      ) : null}
      <div className="relative h-full min-h-0 w-full">
        <Map
          key={`deployment-map-${router.asPath}-${vehicleName ?? 'unknown'}`}
          ref={mapRef}
          className="h-full min-h-0 w-full"
          maxZoom={17}
          onMapReady={(map) => {
            logger.debug('Map is ready!')
            mapRef.current = map
            ;[200, 800].forEach((delay) => {
              setTimeout(() => {
                try {
                  map.invalidateSize()
                } catch (e) {
                  logger.warn('Could not invalidate map size:', e)
                }
              }, delay)
            })
          }}
          center={center}
          centerZoom={centerZoom}
          fitBounds={bounds}
          viewMode={viewMode}
          onRequestCoordinate={handleCoordinateRequest}
          onRequestPlatforms={handlePlatformsRequest}
          onRequestFitBounds={handleFitBoundsRequest}
          onRequestStations={handleLayersRequest}
          onRequestVehicleColors={handleVehicleColorRequest}
          isAddingMarkers={isAddingMarkers}
          onToggleMarkerMode={handleToggleMarkerMode}
          onRequestMarkers={handleMarkersRequest}
          renderMapClickHandler={() => (
            <MapClickHandler
              isAddingMarkers={isAddingMarkers}
              isEditingMarker={false}
              onAddMarker={handleAddMarker}
            />
          )}
          renderCustomMarkerSet={() => (
            <CustomMarkerSet
              isAddingMarkers={isAddingMarkers}
              setIsAddingMarkers={(value) => setIsAddingMarkers(value)}
            />
          )}
          renderDraggableMarkers={() =>
            markers?.map(
              (marker) =>
                // Only render the marker if visible or if visibility !== false
                marker.visible !== false && (
                  <DraggableMarker
                    key={`marker-${marker.id}`}
                    id={marker.id.toString()}
                    position={[marker.lat, marker.lng]}
                    index={marker.index}
                    label={marker.label}
                    draggable={true}
                    isSelected={selectedMarkerId === marker.id.toString()}
                    isNew={marker.isNew}
                    savedToLayer={marker.savedToLayer}
                    iconColor={marker.iconColor || defaultMarkerColor}
                    onClick={() => handleMarkerClick(marker.id.toString())}
                    onDragEnd={(newPos) =>
                      handleMarkerPositionChange(marker.id.toString(), newPos)
                    }
                    onEditStateChange={(isEditing) => {
                      setActiveEditMarkerId(
                        isEditing ? marker.id.toString() : null
                      )
                    }}
                    onEdit={() => handleEditMarker(marker.id.toString())}
                    onDelete={() => handleDeleteMarker(marker.id.toString())}
                    onColorChange={(color) =>
                      handleMarkerColorChange(marker.id.toString(), color)
                    }
                    onSaveToLayer={handleSaveMarkerToLayer}
                    onRemoveFromLayer={(id) =>
                      handleSaveMarkerToLayer(id, false)
                    }
                  />
                )
            )
          }
        >
          <MapDepthDisplay
            depthRequest={handleDepthRequest}
            options={{
              warningToastId: 'depth-unavailable',
              errorToastId: 'depth-result',
              loadingToastId: 'depth-loading',
              warningToastClass: 'blue-toast',
              toastDuration: 5000,
            }}
          />
          {selectedStations.map((station) => {
            const lng = station.geojson.geometry.coordinates[0]
            const lat = station.geojson.geometry.coordinates[1]

            if (
              lng == null ||
              lat == null ||
              !Number.isFinite(lng) ||
              !Number.isFinite(lat)
            )
              return null
            return (
              <StationMarker
                key={station.name}
                name={station.name}
                lat={lat}
                lng={lng}
                isHighlighted={highlightedStationName === station.name}
              />
            )
          })}
          <PlatformPaths />
          <MapFlyTo />
          <VehiclePath
            name={vehicleName as string}
            key={`path${vehicleName}`}
            from={startTime as number}
            to={endTime as number}
            indicatorTime={indicatorTime}
            onScrub={handleMapScrub}
            onGPSFix={handleGPSFix}
            onPositionDataLoaded={markInitialLoadDone}
            // Disable map auto-fit centering when scrubbing the timeline
            disableAutoFit={isTimelineScrubbing}
          />
          {plottedWaypoints?.length ? (
            <>
              {plottedWaypoints.map(({ waypoint, originalIndex }) => {
                const waypointNumber = Number(
                  waypoint.latName?.match(/\d+/)?.[0] ?? originalIndex + 1
                )
                return (
                  <WaypointMapMarker
                    key={`waypoint-${originalIndex}-${waypoint.latName}-${waypoint.lonName}-${waypoint.lat}-${waypoint.lon}`}
                    position={[Number(waypoint.lat), Number(waypoint.lon)]}
                    number={waypointNumber}
                    draggable={editable && focusedWaypointIndex == null}
                    onDragEnd={(newPos) =>
                      handleDragEnd(originalIndex, {
                        lat: newPos[0],
                        lng: newPos[1],
                      })
                    }
                    onDelete={
                      editable
                        ? () => handleDeleteWaypoint(originalIndex)
                        : undefined
                    }
                  />
                )
              })}
              {typeof focusedWaypointIndex === 'number' && (
                <ClickableMapPoint />
              )}
              <WaypointPreviewPath
                waypoints={plottedWaypoints.map(({ waypoint }) => ({
                  lat: Number(waypoint.lat),
                  lon: Number(waypoint.lon),
                }))}
                fitTrigger={waypointFitTrigger}
              />
            </>
          ) : null}
        </Map>
        <MapRefreshButton
          onClick={refreshAll}
          loading={refreshLoading}
          lastRefreshed={lastRefreshed}
        />
      </div>
      <VehicleColorsModal
        isOpen={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        anchorPosition={colorModalPosition}
        trackedVehicles={vehicleName ? [vehicleName] : []}
        activeVehicle={vehicleName || undefined}
        forceShowAll={true}
      />
    </div>
  )
}

export default DeploymentMap
