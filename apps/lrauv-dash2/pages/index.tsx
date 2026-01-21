import { OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import VehicleDeploymentDropdown from '../components/VehicleDeploymentDropdown'
import VehicleList from '../components/VehicleList'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import { SharedPathContextProvider } from '../components/SharedPathContextProvider'
import { SelectedPlatformsProvider } from '../components/SelectedPlatformContext'
import { SelectedStationsProvider } from '../components/SelectedStationContext'
import { useRouter } from 'next/router'
import useGlobalModalId from '../lib/useGlobalModalId'
import useGoogleElevator from '../lib/useGoogleElevator'
import { Allotment, LayoutPriority } from 'allotment'
import { useGoogleMaps } from '../lib/useGoogleMaps'
import { VPosDetail } from '@mbari/api-client'
import 'allotment/dist/style.css'
import { StationsListModal } from '../components/StationsListModal'
import { MapLayersListModal } from '../components/MapLayersListModal'
import { useSelectedStations } from '../components/SelectedStationContext'
import { useMarkers } from '../components/MarkerContext'
import { useDepthRequest } from '@mbari/utils/useDepthRequest'
import toast from 'react-hot-toast'
import type { MapProps } from '@mbari/react-ui/dist/Map/Map'
import { createLogger } from '@mbari/utils'
import { PlatformsListModal } from '../components/PlatformsListModal'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic<CustomMapProps>(
  () => import('@mbari/react-ui/dist/Map/Map'),
  {
    ssr: false,
  }
)

const VehiclePath = dynamic(() => import('../components/VehiclePath'), {
  ssr: false,
})

const StationMarker = dynamic(() => import('../components/StationMarker'), {
  ssr: false,
})

const DraggableMarker = dynamic(() => import('../components/DraggableMarker'), {
  ssr: false,
})

const CustomMarkerSet = dynamic(() => import('../components/CustomMarkerSet'), {
  ssr: false,
})

const MapClickHandler = dynamic(() => import('../components/MapClickHandler'), {
  ssr: false,
})

const PlatformPaths = dynamic(
  () =>
    import('../components/PlatformPaths').then((mod) => ({
      default: mod.PlatformPaths,
    })),
  { ssr: false }
)

const logger = createLogger('OverviewPage')
const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex flex-shrink flex-grow flex-col h-full',
  mapContainer: 'flex flex-shrink flex-grow bg-blue-300 h-full',
  secondary:
    'flex w-full flex-shrink-0 flex-col bg-white border-t-2 border-secondary-300/60',
}

// Interface CustomMarkerProps
type CustomMapProps = MapProps &
  React.RefAttributes<L.Map> & {
    isAddingMarkers?: boolean
    onToggleMarkerMode?: () => void
    trackedVehicles?: { name: string; id?: string }[] // Match the actual type being used
  }

// Interface MarkerData
interface MarkerData {
  id: number
  lat: number
  lng: number
  index: number
  label: string
  iconColor?: string
}

// OverviewMap component
const OverViewMap: React.FC<{
  trackedVehicles: { name: string; id?: string }[]
}> = ({ trackedVehicles }) => {
  // Add mapRef to store the Leaflet map instance
  const mapRef = useRef<L.Map | null>(null)
  const { handleDepthRequest, elevationAvailable } = useGoogleElevator()
  const [center, setCenter] = useState<undefined | [number, number]>()
  const [centerZoom, setCenterZoom] = useState<number | undefined>(undefined)
  const [bounds, setBounds] = useState<
    [[number, number], [number, number]] | undefined
  >()
  const [latestGPS, setLatestGPS] = useState<VPosDetail | undefined>()
  const [showLayersModal, setShowLayersModal] = useState(false)
  const [showVehicleColors, setShowVehicleColors] = useState(false)
  const [showPlatformsModal, setShowPlatformsModal] = useState(false)
  const [viewMode, setViewMode] = useState<'center' | 'bounds' | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [defaultMarkerColor, setDefaultMarkerColor] = useState<string>('red')
  const { selectedStations } = useSelectedStations()
  const { handleDepthRequestWithFeedback } = useDepthRequest(
    handleDepthRequest,
    {
      warningToastId: 'depth-unavailable',
      errorToastId: 'depth-result',
      loadingToastId: 'depth-loading',
      warningToastClass: 'blue-toast',
      toastDuration: 5000,
    }
  )
  const [layersModalPosition, setLayersModalPosition] = useState({
    top: 0,
    left: 0,
  })

  // Marker state
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

  const uniqueTrackedVehicles = Array.from(new Set(trackedVehicles))
  // Store all vehicle positions for bounds calculation
  const vehiclePositions = useRef<Array<[number, number]>>([])

  // Effect to handle vehicle positions
  useEffect(() => {
    // Reset positions when component unmounts or tracked vehicles change
    return () => {
      vehiclePositions.current = []
    }
  }, [trackedVehicles])

  // Force elevation service initialization when component mounts
  useEffect(() => {
    // Try to initialize the elevation service right away - Important!
    if (
      !elevationAvailable &&
      typeof window !== 'undefined' &&
      window.google?.maps
    ) {
      try {
        // Make a dummy request to force initialization
        handleDepthRequest(0, 0).catch(() => {
          logger.debug('Initialized elevation service with dummy request')
        })
      } catch (error) {
        logger.error(
          'Could not pre-initialize elevation service in OverViewMap'
        )
      }
    }
  }, [elevationAvailable, handleDepthRequest])

  useEffect(() => {
    if (mapRef?.current) {
      // Add timeout to ensure map has initialized properly
      setTimeout(() => {
        try {
          // Try multiple ways to access invalidateSize
          if (typeof mapRef?.current?.invalidateSize === 'function') {
            mapRef?.current.invalidateSize()
            logger.debug('Map size invalidated directly')
          } else if (
            mapRef?.current &&
            // Use type assertion to access internal property
            (mapRef?.current as any)._leafletContainer?.invalidateSize
          ) {
            ;(mapRef?.current as any)._leafletContainer.invalidateSize()
            logger.debug('Map size invalidated via _leafletContainer')
          } else if (mapRef?.current?.getContainer?.()) {
            // Try to access via container
            const container = mapRef?.current.getContainer()
            if (container) {
              // Trigger a resize event manually
              const evt = new Event('resize')
              window.dispatchEvent(evt)
              logger.debug('Triggered resize event as fallback')
            }
          } else {
            // Just log once without the full error
            logger.debug('Map layout update: invalidateSize not available yet')
          }
        } catch (err) {
          // Log without the full error trace to reduce console noise
          logger.debug('Could not update map layout yet')
        }
      }, 300)
    }
  }, [showVehicleColors])

  // handleGPSFix - called when a GPS fix is received
  const handleGPSFix = useCallback(
    (gps: VPosDetail) => {
      if ((latestGPS?.isoTime ?? 0) > gps.isoTime || !latestGPS) {
        setLatestGPS(gps)
        const coords: [number, number] = [gps.latitude, gps.longitude]
        setCenter(coords)
        setViewMode('center')
      }
      // Store position for bounds calculation
      vehiclePositions.current.push([gps.latitude, gps.longitude])
      // Limit stored positions to prevent memory issues
      if (vehiclePositions.current.length > 1000) {
        vehiclePositions.current = vehiclePositions.current.slice(-1000)
      }
    },
    [latestGPS, setLatestGPS]
  )

  // Calculate the bounds of all vehicle positions to set map bounds
  const calculateBounds = useCallback(() => {
    // First check for stored positions
    if (vehiclePositions.current.length === 0) {
      // Try to get positions from rendered vehicle paths
      const pathPositions = getAllVehiclePathPoints()

      if (pathPositions.length === 0) {
        toast('No vehicle positions available for bounds calculation')
        return null
      }

      vehiclePositions.current = pathPositions.filter(
        (pos): pos is [number, number] => pos.length === 2
      )
    }

    let minLat = 90,
      maxLat = -90,
      minLng = 180,
      maxLng = -180

    vehiclePositions.current.forEach((pos) => {
      minLat = Math.min(minLat, pos[0])
      maxLat = Math.max(maxLat, pos[0])
      minLng = Math.min(minLng, pos[1])
      maxLng = Math.max(maxLng, pos[1])
    })

    // Larger padding for better visibility - Zoomed out view
    const padding = 0.08
    const newBounds: [[number, number], [number, number]] = [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding],
    ]

    // Return the bounds
    return newBounds
  }, [])

  // Access path points from all vehicle paths
  const getAllVehiclePathPoints = () => {
    const pathPoints: [number, number][] = []

    // Access stored positions first if available
    if (vehiclePositions.current.length > 0) {
      return vehiclePositions.current
    }

    // Access layers if map reference exists
    if (mapRef?.current) {
      try {
        // Store the map reference
        const leafletMap = mapRef?.current

        if (typeof leafletMap.eachLayer === 'function') {
          // Use eachLayer to iterate over all layers
          leafletMap.eachLayer((layer: any) => {
            if (layer._latlngs && Array.isArray(layer._latlngs)) {
              layer._latlngs.forEach((latLng: L.LatLng) => {
                pathPoints.push([latLng.lat, latLng.lng])
              })
            }
          })
        } else {
          logger.warn('Map layers not accessible via eachLayer')
        }
      } catch (e) {
        logger.warn('Error accessing map layers:', e)
      }
    }

    return pathPoints.length > 0
      ? pathPoints
      : [
          [36.7, -122.0], // Default coordinates as fallback
          [36.8, -121.9],
        ]
  }

  // handleCoordinateRequest
  const handleCoordinateRequest = useCallback(() => {
    if (latestGPS) {
      setCenter([latestGPS.latitude, latestGPS.longitude])
      setCenterZoom(15)
      setBounds(undefined)
      setViewMode('center')
    }
  }, [latestGPS])

  // handleFitBoundsRequest - Map requests to fit the bounds
  const handleFitBoundsRequest = useCallback(() => {
    const newBounds = calculateBounds()
    if (newBounds) {
      setBounds(newBounds)
      setCenter(undefined)
      setViewMode('bounds')
      // FitBounds on request and then clear so it is called once
      setTimeout(() => {
        setBounds(undefined)
        setViewMode(null) // Stop enforcing view mode
      }, 1000)
    } // 1 second delay ensures bounds are applied first
  }, [calculateBounds])

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setSelectedMarkerId((prevId) => (prevId === markerId ? null : markerId))

      // Close any open popups if a different marker is selected
      if (mapRef?.current && selectedMarkerId !== markerId) {
        try {
          if (typeof mapRef?.current.closePopup === 'function') {
            mapRef?.current.closePopup()
          } else if (
            mapRef?.current &&
            typeof mapRef?.current.closePopup === 'function'
          ) {
            mapRef?.current.closePopup()
          } else if (mapRef?.current.getContainer) {
            // Find open popups and close them manually
            const container = mapRef?.current.getContainer()
            const popups = container.querySelectorAll('.leaflet-popup')
            if (popups.length > 0) {
              logger.debug('Closing popups manually')
              // Close internal popups
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
      }
    },
    [markers, setActiveEditMarkerId]
  )

  // Handle marker delete request
  const handleDeleteMarker = useCallback(
    (markerId: string) => {
      // New Marker?
      const markerToDelete = markers.find((m) => m.id.toString() === markerId)

      // Clear selection if the deleted marker was selected
      if (selectedMarkerId === markerId) {
        setSelectedMarkerId(null)
      }

      handleMarkerDelete(markerId)
    },
    [handleMarkerDelete, selectedMarkerId, markers]
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

        // Update markers in context/state
        setMarkers(updatedMarkers)

        // If selected marker, update UI state
        if (selectedMarkerId === markerId && !shouldSave) {
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
        }

        // Request user feedback
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

  const handleMarkerPositionChange = useCallback(
    (markerId: string, newPos: [number, number]) => {
      // Convert string ID to number
      const numericId = parseInt(markerId, 10)

      // Convert position array to expected object format
      const positionObj = {
        lat: newPos[0],
        lng: newPos[1],
      }

      // Call handler with formatted parameters
      handleMarkerDragEnd(numericId, positionObj)
    },
    [handleMarkerDragEnd]
  )

  // handleLayersRequest - Requests to show Marker and Station layers
  const handleLayersRequest = useCallback(
    (position?: { top: number; left: number }) => {
      if (position) {
        setLayersModalPosition(position)
      }
      setShowLayersModal(true)
    },
    []
  )

  const handlePlatformsRequest = useCallback(() => {
    setShowPlatformsModal(true)
  }, [])

  // handleCloseLayers - Close the layers modal
  const handleCloseLayers = useCallback(() => {
    setShowLayersModal(false)
  }, [])

  const handleClosePlatforms = useCallback(() => {
    setShowPlatformsModal(false)
  }, [])

  // handleVehicleColorRequest- Show vehicle colors
  const handleVehicleColorRequest = useCallback((vehicleName?: string) => {
    setShowVehicleColors(true)
  }, [])

  // handleCloseVehicleColors - vehicle colors modal is closed
  const handleCloseVehicleColors = useCallback((vehicleName?: string) => {
    setShowVehicleColors(false)

    // Map might need time to adjust after modal closes
    setTimeout(() => {
      if (mapRef?.current) {
        try {
          // Try invalidateSize method(s)
          if (typeof mapRef?.current.invalidateSize === 'function') {
            mapRef?.current.invalidateSize()
          } else {
            // Logs for debugging
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
    }, 300) // Time for modal animation to complete
  }, [])

  useEffect(() => {
    if (mapRef?.current) {
      logger.debug(
        'Available methods:',
        Object.getOwnPropertyNames(mapRef?.current).filter(
          (prop) =>
            mapRef?.current &&
            typeof (mapRef?.current as unknown as Record<string, unknown>)[
              prop
            ] === 'function'
        )
      )
    }
  }, [])

  // Handle map reference
  useEffect(() => {
    logger.debug('mapRef?.current in OverViewMap:', mapRef?.current)
  }, [mapRef])

  return (
    <>
      {showLayersModal ? (
        <MapLayersListModal
          onClose={handleCloseLayers}
          anchorPosition={layersModalPosition}
        />
      ) : null}
      {showPlatformsModal ? (
        <PlatformsListModal onClose={handleClosePlatforms} />
      ) : null}
      <Map
        ref={mapRef}
        className="h-full w-full"
        onMapReady={(map) => {
          logger.debug('🌍 Map ready callback triggered in OverViewMap')
          // Store the Leaflet instance
          mapRef.current = map

          // Force redraw - after map is ready
          setTimeout(() => {
            try {
              map.invalidateSize()
            } catch (e) {
              logger.warn('Could not invalidate map size:', e)
            }
          }, 200)
        }}
        trackedVehicles={trackedVehicles?.map((vehicle) => ({
          ...vehicle,
          id: vehicle.id || vehicle.name, // Ensure id is always present
        }))}
        onRequestDepth={async (lat, lng) => {
          try {
            // Try to remove any leading zeros
            const formattedLat = parseFloat(String(lat).replace(/^0+/, ''))
            // Then use in depth request
            const result = await handleDepthRequestWithFeedback(
              formattedLat,
              lng
            )
            return result.depth !== null ? result.depth : 0
          } catch (error) {
            logger.warn('❌ Error in depth request:', error)
            toast.error('Depth data unavailable', { id: 'depth-error' })
            return 0
          }
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
        onRequestMarkers={handleMarkersRequest}
        isAddingMarkers={isAddingMarkers}
        onToggleMarkerMode={handleToggleMarkerMode}
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
          markers.map(
            (marker) =>
              // Only render the marker if visible or visibility !== false
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
                  onRemoveFromLayer={(id) => handleSaveMarkerToLayer(id, false)}
                />
              )
          )
        }
      >
        {uniqueTrackedVehicles?.map((name, index) => (
          <VehiclePath
            name={name.name}
            key={`path-${name}-${index}`}
            onGPSFix={handleGPSFix}
            grouped
          />
        ))}
        <PlatformPaths />
        {selectedStations?.map((station) => {
          const lng = station.geojson?.geometry?.coordinates[0]
          const lat = station.geojson?.geometry?.coordinates[1]

          if (!lng || !lat) {
            return null
          }

          return (
            <StationMarker
              key={station.name}
              name={station.name}
              lat={lat}
              lng={lng}
            />
          )
        })}
      </Map>
    </>
  )
}

// OverviewPage: NextPage
const OverviewPage: NextPage = () => {
  const { mapsLoaded } = useGoogleMaps()
  const router = useRouter()
  const { trackedVehicles } = useTrackedVehicles()
  const mounted = useRef(false)
  const { setGlobalModalId } = useGlobalModalId()
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      setGlobalModalId(null)
    }
  })
  const handleSelectedVehicle = (vehicle: string) => {
    router.push(`/vehicle/${vehicle}`)
  }

  return (
    <SharedPathContextProvider>
      <SelectedPlatformsProvider>
        <SelectedStationsProvider>
          <div className={styles.content}>
            <Layout>
              {trackedVehicles?.length ? (
                <>
                  <OverviewToolbar deployment={{ name: 'Overview', id: '0' }} />

                  <div
                    className={styles.content}
                    data-testid="vehicle-dashboard"
                  >
                    <Allotment
                      separator
                      snap
                      defaultSizes={[75, 25]}
                      proportionalLayout
                    >
                      <Allotment.Pane>
                        <section className={styles.primary}>
                          <div className={styles.mapContainer}>
                            {mapsLoaded && (
                              <OverViewMap
                                trackedVehicles={trackedVehicles.map(
                                  (vehicle) => ({ name: vehicle })
                                )}
                              />
                            )}
                          </div>
                        </section>
                      </Allotment.Pane>
                      <Allotment.Pane priority={LayoutPriority.High}>
                        <div style={{ overflowY: 'auto', height: '100%' }}>
                          <section className={styles.secondary}>
                            <VehicleList
                              onSelectVehicle={handleSelectedVehicle}
                            />
                          </section>
                        </div>
                      </Allotment.Pane>
                    </Allotment>
                  </div>
                </>
              ) : (
                <>
                  <p className="p-6 text-xl" aria-label="get started">
                    To get started you must add at least one vehicle to track.
                  </p>
                  <VehicleDeploymentDropdown
                    className="mx-6 max-h-96 w-96"
                    scrollable
                  />
                </>
              )}
            </Layout>
          </div>
        </SelectedStationsProvider>
      </SelectedPlatformsProvider>
    </SharedPathContextProvider>
  )
}

export default OverviewPage
