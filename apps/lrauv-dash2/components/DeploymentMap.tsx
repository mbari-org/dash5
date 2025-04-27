import dynamic from 'next/dynamic'
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { useManagedWaypoints } from '@mbari/react-ui'
import useGoogleElevator from '../lib/useGoogleElevator'
import { VPosDetail } from '@mbari/api-client'
import { StationsListModal } from './StationsListModal'
import { useSelectedStations } from './SelectedStationContext'
import { useMarkers } from './MarkerContext'
import { toast } from 'react-hot-toast'
import { createLogger } from '@mbari/utils'
import VehicleColorsModal from './VehicleColorsModal'
import useTrackedVehicles from '../lib/useTrackedVehicles'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})
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
const StationMarker = dynamic(() => import('../components/StationMarker'), {
  ssr: false,
})
const MapClickHandler = dynamic(() => import('./MapClickHandler'), {
  ssr: false,
})
const CustomMarkerSet = dynamic(() => import('./CustomMarkerSet'), {
  ssr: false,
})

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
  const mapRef = useRef<any>(null)
  const {
    updatedWaypoints,
    handleWaypointsUpdate,
    editable,
    focusedWaypointIndex,
  } = useManagedWaypoints()
  const handleDragEnd = useCallback(
    (index: number, { lat, lng }: { lat: number; lng: number }) =>
      handleWaypointsUpdate(
        updatedWaypoints.map((m, i) =>
          i === index ? { ...m, lat: lat.toString(), lon: lng.toString() } : m
        )
      ),
    [updatedWaypoints, handleWaypointsUpdate]
  )
  const [elevationData, setElevationData] = useState<{
    depth: number | null
    status: string
    position?: [number, number]
  }>({ depth: null, status: 'none' })
  const plottedWaypoints = updatedWaypoints.filter(
    (wp) => ![wp.lat?.toLowerCase(), wp.lon?.toLowerCase()].includes('nan')
  )

  const { trackedVehicles } = useTrackedVehicles()
  const [showAll, setShowAll] = useState(true)
  const { handleDepthRequest, elevationAvailable } = useGoogleElevator()
  const [center, setCenter] = useState<undefined | [number, number]>()
  const [centerZoom, setCenterZoom] = useState<number | undefined>(undefined)
  const [bounds, setBounds] = useState<
    [[number, number], [number, number]] | undefined
  >()
  const [latestGPS, setLatestGPS] = useState<VPosDetail | undefined>()
  const [viewMode, setViewMode] = useState<'center' | 'bounds' | null>(null)
  const [showStations, setShowStations] = useState(false)
  const [showVehicleColors, setShowVehicleColors] = useState(false)
  const { selectedStations } = useSelectedStations()
  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [colorModalPosition, setColorModalPosition] = useState<{
    top: number
    left: number
  }>({ top: 0, left: 0 })

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
  } = useMarkers()

  const latestVehicle = useRef(vehicleName)
  useEffect(() => {
    if (vehicleName !== latestVehicle.current) {
      setLatestGPS(undefined)
      setCenter(undefined)
      latestVehicle.current = vehicleName
    }
  }, [vehicleName, setLatestGPS])

  useEffect(() => {
    if (mapRef.current && !showVehicleColors) {
      setTimeout(() => {
        try {
          // Try to invalidateSize method(s)
          if (typeof mapRef.current.invalidateSize === 'function') {
            mapRef.current.invalidateSize()
          } else if (
            mapRef.current._leafletContainer &&
            typeof mapRef.current._leafletContainer.invalidateSize ===
              'function'
          ) {
            mapRef.current._leafletContainer.invalidateSize()
          } else if (
            mapRef.current.leafletElement &&
            typeof mapRef.current.leafletElement.invalidateSize === 'function'
          ) {
            mapRef.current.leafletElement.invalidateSize()
          } else {
            // Log what we have for debugging
            logger.debug('Map structure:', mapRef.current)
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
      if (gps.latitude && gps.longitude) {
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

  const handleDepthRequestWithFeedback = useCallback(
    async (lat: number, lng: number) => {
      try {
        // Call the elevation service
        const result = await handleDepthRequest(lat, lng)

        // Update state with the result
        setElevationData({
          depth: result.depth,
          status: result.status,
          position: [lat, lng],
        })

        // Show appropriate toast status
        toast.dismiss('depth-loading')
        if (result.status === 'success') {
        } else if (
          result.status === 'unavailable' ||
          result.status === 'no-data'
        ) {
          toast('⚠️ Maps Depth data currently unavailable❕', {
            id: 'depth-result',
            className: 'blue-toast',
          })
        }
        return result
      } catch (error) {
        toast.dismiss('depth-loading')
        toast.error('Error fetching depth data', { id: 'depth-result' })
        return { depth: null, status: 'error' }
      }
    },
    [handleDepthRequest]
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

  // Handler for showing stations
  const handleStationsRequest = useCallback(() => {
    setShowStations(true)
  }, [])

  // Handler for closing the stations modal
  const handleCloseStations = useCallback(() => {
    setShowStations(false)
  }, [])

  const handleVehicleColorRequest = useCallback(() => {
    // Add debugging to verify values
    logger.debug('Opening color modal with:', {
      vehicleName,
      trackedVehicles,
      modalTrackedVehicles: vehicleName ? [vehicleName] : [],
    })

    setColorModalPosition({
      top: 100,
      left: 100,
    })
    setColorModalOpen(true)
  }, [vehicleName, trackedVehicles])

  const handleCloseVehicleColors = useCallback((vehicleName?: string) => {
    setShowVehicleColors(false)

    // Time for map to adjust after modal closes
    setTimeout(() => {
      if (mapRef.current) {
        try {
          // Try invalidateSize method(s)
          if (typeof mapRef.current.invalidateSize === 'function') {
            mapRef.current.invalidateSize()
          } else if (
            mapRef.current._leafletContainer &&
            typeof mapRef.current._leafletContainer.invalidateSize ===
              'function'
          ) {
            mapRef.current._leafletContainer.invalidateSize()
          } else {
            // Log for debugging
            logger.debug('Map reference type:', typeof mapRef.current)
            logger.debug(
              'Map reference properties:',
              Object.keys(mapRef.current)
            )
          }
          logger.debug('Map size invalidated after closing modal')
        } catch (e) {
          logger.warn('Error invalidating map size:', e)
        }
      }
    }, 300) // Slightly longer timeout for modal animation to complete
  }, [])

  // Handler for showing platforms
  // This function is called when the user requests to show platforms
  // This is a placeholder function and should be implemented as needed
  const handlePlatformsRequest = useCallback(() => {
    logger.debug('Platforms request initiated')
    // TODO: Implement the logic to handle platform requests here
    // This will involve fetching platform data source
    // For now, logging a message to indicate the function was called
  }, [])

  const modalTrackedVehicles = React.useMemo(() => {
    if (!vehicleName) return trackedVehicles

    // Create a new array with the current vehicle
    return Array.from(new Set([...trackedVehicles, vehicleName]))
  }, [trackedVehicles, vehicleName])

  return (
    <>
      {showStations ? (
        <StationsListModal onClose={handleCloseStations} />
      ) : null}
      <Map
        ref={mapRef}
        className="h-full w-full"
        maxZoom={17}
        onMapReady={(map) => {
          logger.debug('Map is ready!')
          mapRef.current = map
        }}
        onRequestDepth={async (lat, lng) => {
          const result = await handleDepthRequestWithFeedback(lat, lng)
          return result.depth ?? 0
        }}
        center={center}
        centerZoom={centerZoom}
        fitBounds={bounds}
        viewMode={viewMode}
        onRequestCoordinate={handleCoordinateRequest}
        onRequestPlatforms={handlePlatformsRequest}
        onRequestFitBounds={handleFitBoundsRequest}
        onRequestStations={handleStationsRequest}
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
          markers.map((marker) => (
            <DraggableMarker
              key={`marker-${marker.id}`}
              id={marker.id.toString()}
              position={[marker.lat, marker.lng]}
              index={marker.index}
              label={marker.label}
              draggable={true}
              isSelected={activeEditMarkerId === marker.id.toString()}
              isNew={marker.isNew}
              savedToLayer={marker.savedToLayer}
              onDragEnd={(newPos) =>
                handleMarkerDragEnd(marker.id, {
                  lat: newPos[0],
                  lng: newPos[1],
                })
              }
              iconColor={marker.iconColor}
              onColorChange={(color) =>
                handleMarkerColorChange(marker.id.toString(), color)
              }
              onDelete={() => handleMarkerDelete(marker.id.toString())}
              onEdit={(newLabel) =>
                handleMarkerLabelChange(marker.id.toString(), newLabel)
              }
              onEditStateChange={(isEditing) => {
                setActiveEditMarkerId(isEditing ? marker.id.toString() : null)
              }}
            />
          ))
        }
      >
        {selectedStations.map((station) => {
          const lng = station.geojson.geometry.coordinates[0]
          const lat = station.geojson.geometry.coordinates[1]

          if (!lng || !lat) return null
          return (
            <StationMarker
              key={station.name}
              name={station.name}
              lat={lat}
              lng={lng}
            />
          )
        })}
        {plottedWaypoints?.length ? (
          <>
            {/* TODO: {plottedWaypoints.map((m, i) => {
              const index = Number(m.latName.match(/\d+/)?.[0] ?? i)
              return (
                <DraggableMarker
                  lat={Number(m.lat)}
                  lng={Number(m.lon)}
                  key={`${m.latName}-${m.lonName}-${m.lat}-${m.lon}`}
                  index={index - 1}
                  draggable={editable && !focusedWaypointIndex}
                  onDragEnd={handleDragEnd}
                />
              )
            })} */}
            {!!focusedWaypointIndex && <ClickableMapPoint />}
            <WaypointPreviewPath
              waypoints={plottedWaypoints.map((wp) => ({
                lat: Number(wp.lat),
                lon: Number(wp.lon),
              }))}
            />
          </>
        ) : (
          <VehiclePath
            name={vehicleName as string}
            key={`path${vehicleName}`}
            from={startTime as number}
            to={endTime as number}
            indicatorTime={indicatorTime}
            onScrub={handleScrub}
            onGPSFix={handleGPSFix}
          />
        )}
        <VehicleColorsModal
          isOpen={colorModalOpen}
          onClose={() => setColorModalOpen(false)}
          anchorPosition={colorModalPosition}
          trackedVehicles={vehicleName ? [vehicleName] : []}
          activeVehicle={vehicleName || undefined}
          forceShowAll={true}
        />
      </Map>
    </>
  )
}

export default DeploymentMap
