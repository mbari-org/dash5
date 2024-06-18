import { OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import React, { useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import VehicleDeploymentDropdown from '../components/VehicleDeploymentDropdown'
import VehicleList from '../components/VehicleList'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import { SharedPathContextProvider } from '../components/SharedPathContextProvider'
import { useRouter } from 'next/router'
import useGlobalModalId from '../lib/useGlobalModalId'
import { useGoogleElevator } from '../lib/useGoogleElevator'
import { Allotment, LayoutPriority } from 'allotment'
import { useGoogleMaps } from '../lib/useGoogleMaps'
import 'allotment/dist/style.css'
import toast from 'react-hot-toast'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})

const VehiclePath = dynamic(() => import('../components/VehiclePath'), {
  ssr: false,
})
const DraggableMarker = dynamic(() => import('../components/DraggableMarker'), {
  ssr: false,
})
const ClickableMapPoint = dynamic(
  () => import('../components/ClickableMapPoint'),
  { ssr: false }
)

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex flex-shrink flex-grow flex-col h-full',
  mapContainer: 'flex flex-shrink flex-grow bg-blue-300 h-full',
  secondary:
    'flex w-full flex-shrink-0 flex-col bg-white border-t-2 border-secondary-300/60',
}

// const CustomMarkerSet: React.FC = () => {
//   const [markers, setMarkers] = React.useState<
//     { lat: number; lng: number; label: string }[]
//   >([])
//   const [markerIndex, setMarkerIndex] = React.useState(0)
//   const handleNewMarker = useCallback(
//     (lat: number, lng: number) => {
//       console.log('new marker', lat, lng)
//       setMarkers([
//         ...markers,
//         { lat, lng, label: `Marker ${markers.length + 1}` },
//       ])
//       setMarkerIndex(markerIndex + 1)
//     },
//     [setMarkerIndex, markers, setMarkers]
//   )
//   return (
//     <>
//       <ClickableMapPoint onClick={handleNewMarker} />
//       {markers.map((marker, index) => (
//         <DraggableMarker
//           lat={marker.lat}
//           lng={marker.lng}
//           index={index}
//           key={[marker.label, index].join('-')}
//           draggable
//           onDragEnd={(index, latlng) => {
//             setMarkers(
//               markers.map((m, i) =>
//                 i === index ? { ...m, lat: latlng.lat, lng: latlng.lng } : m
//               )
//             )
//           }}
//         />
//       ))}
//     </>
//   )
// }

const OverViewMap: React.FC<{
  trackedVehicles: string[]
}> = ({ trackedVehicles }) => {
  const { handleDepthRequest } = useGoogleElevator()
  const [center, setCenter] = useState<undefined | [number, number]>()
  const [latestGPS, setLatestGPS] = useState<VPosDetail | undefined>()

  const handleGPSFix = useCallback(
    (gps: VPosDetail) => {
      console.log('GPS Fix', gps.isoTime, 'vs', latestGPS?.isoTime)
      if ((latestGPS?.isoTime ?? 0) > gps.isoTime || !latestGPS) {
        setLatestGPS(gps)
      }
    },
    [latestGPS, setLatestGPS]
  )

  const handleCoordinateRequest = useCallback(() => {
    if (latestGPS) {
      setCenter([latestGPS?.latitude, latestGPS?.longitude])
    }
  }, [latestGPS, setCenter])

  return (
    <SharedPathContextProvider>
      <Map
        className="h-full w-full"
        onRequestDepth={handleDepthRequest}
        onRequestCoordinate={handleCoordinateRequest}
        center={center}
      >
        {trackedVehicles.map((name) => (
          <VehiclePath
            name={name}
            key={`path${name}`}
            onGPSFix={handleGPSFix}
            grouped
          />
        ))}
      </Map>
    </SharedPathContextProvider>
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
    <Layout>
      {trackedVehicles?.length ? (
        <>
          <OverviewToolbar deployment={{ name: 'Overview', id: '0' }} />

          <div className={styles.content} data-testid="vehicle-dashboard">
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
                  <VehicleList onSelectVehicle={handleSelectedVehicle} />
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
  )
}

export default OverviewPage
