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
import { useGoogleElevator } from '../lib/useGoogleElevator'
import { Allotment, LayoutPriority } from 'allotment'
import { useGoogleMaps } from '../lib/useGoogleMaps'
import { VPosDetail } from '@mbari/api-client'
import 'allotment/dist/style.css'
import toast from 'react-hot-toast'
import { StationsListModal } from '../components/StationsListModal'
import { useSelectedStations } from '../components/SelectedStationContext'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})

const VehiclePath = dynamic(() => import('../components/VehiclePath'), {
  ssr: false,
})

const StationMarker = dynamic(() => import('../components/StationMarker'), {
  ssr: false,
})
// TODO: Set up Draggable Marker and ClickableMapPoint
// const DraggableMarker = dynamic(() => import('../components/DraggableMarker'), {
//   ssr: false,
// })
// const ClickableMapPoint = dynamic(
//   () => import('../components/ClickableMapPoint'),
//   { ssr: false }
// )

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex flex-shrink flex-grow flex-col h-full',
  mapContainer: 'flex flex-shrink flex-grow bg-blue-300 h-full',
  secondary:
    'flex w-full flex-shrink-0 flex-col bg-white border-t-2 border-secondary-300/60',
}

const CustomMarkerSet: React.FC = () => {
  const [markers, setMarkers] = React.useState<
    { lat: number; lng: number; label: string }[]
  >([])
  const [markerIndex, setMarkerIndex] = React.useState(0)
  const handleNewMarker = useCallback(
    (lat: number, lng: number) => {
      setMarkers([
        ...markers,
        { lat, lng, label: `Marker ${markers.length + 1}` },
      ])
      setMarkerIndex((prevIndex) => prevIndex + 1)
    },
    [markers, setMarkers]
  )
  return null
  // TO-DO: Implement DraggableMarker and ClickableMapPoint
  // return (
  //   <>

  /* <ClickableMapPoint onClick={handleNewMarker} />
      {markers.map((marker, index) => (
        <DraggableMarker
          lat={marker.lat}
          lng={marker.lng}
          index={index}
          key={[marker.label, index].join('-')}
          draggable
          onDragEnd={(index, latlng) => {
            setMarkers(
              markers.map((m, i) =>
                i === index ? { ...m, lat: latlng.lat, lng: latlng.lng } : m
              )
            )
          }}
        />
      ))} */
}

const OverViewMap: React.FC<{
  trackedVehicles: string[]
}> = ({ trackedVehicles }) => {
  const { handleDepthRequest } = useGoogleElevator()
  const [center, setCenter] = useState<undefined | [number, number]>()
  const [centerZoom, setCenterZoom] = useState<number | undefined>(undefined)
  const [bounds, setBounds] = useState<
    [[number, number], [number, number]] | undefined
  >()
  const [latestGPS, setLatestGPS] = useState<VPosDetail | undefined>()
  const [showStations, setShowStations] = useState(false)
  const [viewMode, setViewMode] = useState<'center' | 'bounds' | null>(null)
  const { selectedStations } = useSelectedStations()

  // Store all vehicle positions for bounds calculation
  const vehiclePositions = useRef<Array<[number, number]>>([])

  // Add at the start of the component:
  useEffect(() => {
    // Reset positions when component unmounts or tracked vehicles change
    return () => {
      vehiclePositions.current = []
    }
  }, [trackedVehicles])

  const handleGPSFix = useCallback(
    (gps: VPosDetail) => {
      if ((latestGPS?.isoTime ?? 0) > gps.isoTime || !latestGPS) {
        setLatestGPS(gps)
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

  // Calculate bounds from all tracked vehicle positions
  const calculateBounds = useCallback(() => {
    if (vehiclePositions.current.length === 0) {
      console.warn('No vehicle positions available for bounds calculation')
      return
    }

    // Find min/max lat/lon
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

    // Add padding (0.1 degrees)
    const padding = 0.1
    const newBounds: [[number, number], [number, number]] = [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding],
    ]
    setBounds(newBounds)
  }, [])

  // Handler for centering on latest position
  const handleCoordinateRequest = useCallback(() => {
    if (latestGPS) {
      setCenter([latestGPS.latitude, latestGPS.longitude])
      setCenterZoom(15)
      setBounds(undefined)
      // Set the view mode to force a re-render even if coordinates haven't changed
      setViewMode('center')
    }
  }, [latestGPS])

  // Handler for fitting bounds to all vehicles
  const handleFitBoundsRequest = useCallback(() => {
    calculateBounds()
    setCenter(undefined) // Clear center when using bounds
    // Set the view mode to force a re-render
    setViewMode('bounds')
  }, [calculateBounds])

  const handleStationsRequest = useCallback(() => {
    setShowStations(true)
  }, [setShowStations])

  // Add this handler to close the modal
  const handleCloseStations = useCallback(() => {
    setShowStations(false)
  }, [setShowStations])

  return (
    <>
      {showStations ? (
        <StationsListModal onClose={handleCloseStations} />
      ) : null}

      <Map
        className="h-full w-full"
        onRequestDepth={handleDepthRequest}
        center={center}
        centerZoom={centerZoom}
        fitBounds={bounds}
        viewMode={viewMode}
        onRequestCoordinate={handleCoordinateRequest}
        onRequestFitBounds={handleFitBoundsRequest}
        onRequestStations={handleStationsRequest}
      >
        {trackedVehicles.map((name) => (
          <VehiclePath
            name={name}
            key={`path${name}`}
            onGPSFix={handleGPSFix}
            grouped
          />
        ))}
        {selectedStations.map((station) => {
          const lng = station.geojson?.geometry?.coordinates[0]
          const lat = station.geojson?.geometry?.coordinates[1]

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
        <CustomMarkerSet />
      </Map>
    </>
  )
}

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
                              <OverViewMap trackedVehicles={trackedVehicles} />
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
