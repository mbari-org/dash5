import dynamic from 'next/dynamic'
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { useManagedWaypoints, Station } from '@mbari/react-ui'
import { useGoogleElevator } from '../lib/useGoogleElevator'
import { VPosDetail } from '@mbari/api-client'
import { PlatformsListModal } from './PlatformsListModal'
import { StationsListModal } from './StationsListModal'
import { useSelectedStations } from './SelectedStationContext'
import { useSelectedPlatforms } from './SelectedPlatformContext'
// import { CenterViewComponent } from 'react-ui/dist/Map/MapViews'

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
  const plottedWaypoints = updatedWaypoints.filter(
    (wp) => ![wp.lat?.toLowerCase(), wp.lon?.toLowerCase()].includes('nan')
  )

  const { handleDepthRequest } = useGoogleElevator()
  const [center, setCenter] = useState<undefined | [number, number]>()
  const [bounds, setBounds] = useState<
    [[number, number], [number, number]] | undefined
  >()
  const [latestGPS, setLatestGPS] = useState<VPosDetail | undefined>()
  const [showStations, setShowStations] = useState(false)
  const { selectedStations } = useSelectedStations()

  const latestVehicle = useRef(vehicleName)
  useEffect(() => {
    if (vehicleName !== latestVehicle.current) {
      setLatestGPS(undefined)
      setCenter(undefined)
      latestVehicle.current = vehicleName
    }
  }, [vehicleName, setLatestGPS])

  useEffect(() => {
    if (!latestGPS?.latitude || !latestGPS?.longitude) return

    if (
      !center ||
      center[0] !== latestGPS.latitude ||
      center[1] !== latestGPS.longitude
    ) {
      setCenter([latestGPS.latitude, latestGPS.longitude])
    }
  }, [latestGPS]) // Intentionally omitting center from dependencies to avoid infinite loop

  // Store positions of all vehicles to calculate center
  const vehiclePosition = useRef<Array<[number, number]>>([])
  // Track vehicle path points for bounds calculation
  const pathPoints = useRef<Array<[number, number]>>([])

  const handleGPSFix = useCallback(
    (gps: VPosDetail) => {
      // Reset the array if this is a different vehicle
      if ((latestGPS?.isoTime ?? 0) > gps.isoTime || !latestGPS) {
        vehiclePosition.current = []
        setLatestGPS(gps)
      }
      // Store all points for path bounds calculation
      pathPoints.current.push([gps.latitude, gps.longitude])
      // Store position for centering
      const position: [number, number] = [gps.latitude, gps.longitude]
      vehiclePosition.current.push(position)
    },
    [latestGPS, setLatestGPS]
  )

  // Calculate bounds for the entire vehicle path
  const calculatePathBounds = useCallback(() => {
    if (pathPoints.current.length === 0) {
      console.warn('No path points available for bounds calculation')
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

    console.log('Calculated path bounds:', newBounds)
    setBounds(newBounds)
  }, [])

  const handleCoordinateRequest = useCallback(() => {
    if (latestGPS) {
      setCenter([latestGPS?.latitude, latestGPS?.longitude])
    }
  }, [latestGPS, setCenter])

  // Handler for fitting bounds to entire path
  const handleFitBoundsRequest = useCallback(() => {
    calculatePathBounds()
  }, [calculatePathBounds])

  // Function to calculate the center of all vehicle positions
  const calculateCenter = useCallback((): [number, number] => {
    if (vehiclePosition.current.length === 0) {
      // Default center if no positions
      return [36.7849, -122.12097]
    }

    // Calculate the average latitude and longitude
    const sum = vehiclePosition.current.reduce(
      (acc, pos) => [acc[0] + pos[0], acc[1] + pos[1]],
      [0, 0]
    )

    return [
      sum[0] / vehiclePosition.current.length,
      sum[1] / vehiclePosition.current.length,
    ]
  }, [])

  const [showPlatforms, setShowPlatforms] = useState(false)
  const { selectedPlatforms } = useSelectedPlatforms()
  const handlePlatformsRequest = useCallback(() => {
    setShowPlatforms(true)
  }, [setShowPlatforms])

  const handleClosePlatforms = useCallback(() => {
    setShowPlatforms(false)
  }, [setShowPlatforms])

  const handleStationsRequest = useCallback(() => {
    console.log('DeploymentMap.tsx - Stations Request Clicked')
    setShowStations(true)
  }, [setShowStations])

  const handleCloseStations = useCallback(() => {
    setShowStations(false)
  }, [setShowStations])

  return (
    <>
      {showPlatforms ? (
        <PlatformsListModal onClose={handleClosePlatforms} />
      ) : null}
      {showStations ? (
        <StationsListModal onClose={handleCloseStations} />
      ) : null}
      <Map
        className="h-full w-full"
        maxZoom={17}
        onRequestDepth={handleDepthRequest}
        center={center}
        fitBounds={bounds}
        onRequestCoordinate={handleCoordinateRequest}
        onRequestPlatforms={handlePlatformsRequest}
        onRequestFitBounds={handleFitBoundsRequest}
        onRequestStations={handleStationsRequest}
      >
        {selectedStations.map((station) => {
          const lng = station.geojson.geometry.coordinates[0]
          const lat = station.geojson.geometry.coordinates[1]

          if (!lng || !lat) return null

          console.log('Stations: Valid coordinates found:', lat, lng)

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
            {plottedWaypoints.map((m, i) => {
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
            })}
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
            // onCenter={handleCoordinateRequest}
          />
        )}
      </Map>
    </>
  )
}

export default DeploymentMap
