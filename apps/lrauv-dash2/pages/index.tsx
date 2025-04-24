import { OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { useSelectedStations } from '../components/SelectedStationContext'
import { useMarkers } from '../components/MarkerContext'
import toast from 'react-hot-toast'
import type { MapProps } from '@mbari/react-ui/dist/Map/Map'
import { createLogger } from '@mbari/utils'

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

const logger = createLogger('OverviewPage')
const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex flex-shrink flex-grow flex-col h-full',
  mapContainer: 'flex flex-shrink flex-grow bg-blue-300 h-full',
  secondary:
    'flex w-full flex-shrink-0 flex-col bg-white border-t-2 border-secondary-300/60',
}

// interface CustomMarkerProps
type CustomMapProps = MapProps &
  React.RefAttributes<L.Map> & {
    isAddingMarkers?: boolean
    onToggleMarkerMode?: () => void
    trackedVehicles?: { name: string; id?: string }[] // Match the actual type being used
  }

// interface MarkerData
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
  const [showStations, setShowStations] = useState(false)
  const [showVehicleColors, setShowVehicleColors] = useState(false)
  const [viewMode, setViewMode] = useState<'center' | 'bounds' | null>(null)
  const { selectedStations } = useSelectedStations()
  // Add state to track elevation data and loading state
  const [elevationData, setElevationData] = useState<{
    depth: number | null
    status: string
    position?: [number, number]
  }>({ depth: null, status: 'none' })

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
    if (mapRef.current) {
      // Add timeout to ensure map has initialized properly
      setTimeout(() => {
        try {
          // Try multiple ways to access invalidateSize
          if (typeof mapRef.current?.invalidateSize === 'function') {
            mapRef.current.invalidateSize()
            logger.debug('Map size invalidated directly')
          } else if (
            mapRef.current &&
            // Use type assertion to access internal property
            (mapRef.current as any)._leafletContainer?.invalidateSize
          ) {
            ;(mapRef.current as any)._leafletContainer.invalidateSize()
            logger.debug('Map size invalidated via _leafletContainer')
          } else if (mapRef.current?.getContainer?.()) {
            // Try to access via container
            const container = mapRef.current.getContainer()
            if (container) {
              // Trigger a resize event manually
              const evt = new Event('resize')
              window.dispatchEvent(evt)
              logger.debug('Triggered resize event as fallback')
            }
          } else {
            // Just log it once without the full error
            logger.debug('Map layout update: invalidateSize not available yet')
          }
        } catch (err) {
          // Log without the full error trace to reduce console noise
          logger.debug('Could not update map layout yet')
        }
      }, 300)
    }
  }, [showVehicleColors])

  // handleGPSFix function
  // This function is called when a GPS fix is received
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

    // Larger padding for better visibility
    const padding = 0.1
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

    // Try to access layers if map reference exists
    if (mapRef.current) {
      try {
        // Store the map reference
        const leafletMap = mapRef.current

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
    }
  }, [calculateBounds])

  // Create a wrapper for the depth request that updates state
  const handleDepthRequestWithFeedback = useCallback(
    async (lat: number, lng: number) => {
      try {
        // Call elevation service
        const result = await handleDepthRequest(lat, lng)

        // Update state with result
        setElevationData({
          depth: result.depth,
          status: result.status,
          position: [lat, lng],
        })

        // Show appropriate toast based on status
        toast.dismiss('depth-loading')
        if (result.status === 'success') {
        } else if (result.status === 'unavailable' || 'no-data') {
          // toast('⚠️ Maps Depth data currently unavailable❕', {
          //   id: 'depth-result',
          //   className: 'blue-toast',
          // })
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

  // handleStationsRequest - Requests to show stations
  const handleStationsRequest = useCallback(() => {
    setShowStations(true)
  }, [])

  // handleCloseStations - stations modal is closed
  const handleCloseStations = useCallback(() => {
    setShowStations(false)
  }, [])

  // handleVehicleColorRequest- Show vehicle colors
  const handleVehicleColorRequest = useCallback((vehicleName?: string) => {
    setShowVehicleColors(true)
  }, [])

  // handleCloseVehicleColors - vehicle colors modal is closed
  const handleCloseVehicleColors = useCallback((vehicleName?: string) => {
    setShowVehicleColors(false)

    // Needed map time to adjust after modal closes
    setTimeout(() => {
      if (mapRef.current) {
        try {
          // Try invalidateSize method(s)
          if (typeof mapRef.current.invalidateSize === 'function') {
            mapRef.current.invalidateSize()
          } else {
            // Log what we have for debugging
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

  useEffect(() => {
    // Log the map reference when it changes
    logger.debug(
      'Map reference type:',
      mapRef.current ? typeof mapRef.current : 'null'
    )
    logger.debug(
      'Map reference has invalidateSize:',
      mapRef.current && typeof mapRef.current.invalidateSize === 'function'
    )

    if (mapRef.current) {
      logger.debug(
        'Available methods:',
        Object.getOwnPropertyNames(mapRef.current).filter(
          (prop) =>
            mapRef.current &&
            typeof (mapRef.current as unknown as Record<string, unknown>)[
              prop
            ] === 'function'
        )
      )
    }
  }, [])

  // Handle map reference
  useEffect(() => {
    logger.debug('mapRef.current in OverViewMap:', mapRef.current)
  }, [mapRef])

  return (
    logger.debug('Rendering Map with children'),
    (
      <>
        {showStations ? (
          <StationsListModal onClose={handleCloseStations} />
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
          trackedVehicles={trackedVehicles.map((vehicle) => ({
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
          onRequestFitBounds={handleFitBoundsRequest}
          onRequestStations={handleStationsRequest}
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
            markers.map((marker) => (
              <DraggableMarker
                key={`marker-${marker.id}`}
                id={marker.id.toString()}
                position={[marker.lat, marker.lng]}
                index={marker.index}
                label={marker.label}
                draggable={true}
                isSelected={activeEditMarkerId === marker.id.toString()} // Pass active edit state
                isNew={marker.isNew} // Pass new marker state
                onDragEnd={(pos) =>
                  handleMarkerDragEnd(marker.id, {
                    lat: pos[0],
                    lng: pos[1],
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
          {uniqueTrackedVehicles.map((name, index) => (
            <VehiclePath
              name={name.name}
              key={`path-${name}-${index}`}
              onGPSFix={handleGPSFix}
              grouped
            />
          ))}
          {selectedStations.map((station) => {
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
                        <section className={styles.secondary}>
                          <VehicleList
                            onSelectVehicle={handleSelectedVehicle}
                          />
                        </section>
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
