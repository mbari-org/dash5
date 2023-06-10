import dynamic from 'next/dynamic'
import { useCallback } from 'react'
import { useManagedWaypoints } from '@mbari/react-ui'
import { useSiteConfig } from 'api-client'

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

interface DeploymentMapProps {
  vehicleName?: string | null
  indicatorTime?: number | null
  onScrub?: (time?: number | null) => void
  startTime?: number | null
  endTime?: number | null
}

// Define a type for the LatLng input to the function
interface LatLng {
  latitude: number
  longitude: number
}

// Define types for the API response
interface ElevationResponse {
  results: Array<{ elevation: number }>
  status: string
}

async function getElevation(
  { latitude, longitude }: LatLng,
  apiKey: string
): Promise<number | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/elevation/json?locations=${latitude}%2C${longitude}&key=${apiKey}`
  )
  const data: ElevationResponse = await response.json()

  if (data.status !== 'OK') {
    console.error('Failed to get elevation:', data.status)
    return null
  }

  return data.results[0].elevation
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

  const { data } = useSiteConfig({})
  const googleApiKey = data?.appConfig.googleApiKey

  const handleDepthRequest = useCallback(
    async (lat: number, lng: number) => {
      if (!googleApiKey) {
        return 0
      }
      const elevation = await getElevation(
        { latitude: lat, longitude: lng },
        googleApiKey
      )
      return elevation ?? 0
    },
    [googleApiKey]
  )

  return (
    <Map
      className="h-full w-full"
      maxZoom={17}
      onRequestDepth={handleDepthRequest}
    >
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
          from={startTime as number}
          to={endTime as number}
          indicatorTime={indicatorTime}
          onScrub={handleScrub}
        />
      )}
    </Map>
  )
}

export default DeploymentMap
