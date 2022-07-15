import { MissionProgressToolbar, OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import VehicleList from '../components/VehicleList'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import { SharedPathContextProvider } from '../components/SharedPathContextProvider'
import { useRouter } from 'next/router'
import useGlobalModalId from '../lib/useGlobalModalId'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})

const VehiclePath = dynamic(() => import('../components/VehiclePath'), {
  ssr: false,
})

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex w-3/4 flex-shrink flex-grow flex-col',
  mapContainer: 'flex flex-shrink flex-grow bg-blue-300',
  secondary:
    'flex w-[438px] flex-shrink-0 flex-col bg-white border-t-2 border-secondary-300/60',
}

const OverviewPage: NextPage = () => {
  const router = useRouter()
  const { trackedVehicles } = useTrackedVehicles()
  const startTime = DateTime.utc().minus({ weeks: 1 }).toISO()
  const endTime = DateTime.utc().plus({ days: 4 }).toISO()
  const mounted = useRef(false)
  const { setGlobalModalId } = useGlobalModalId()
  useEffect(() => {
    mounted.current = true
  })
  const handleSelectedVehicle = (vehicle: string) => {
    router.push(`/vehicle/${vehicle}`)
  }
  return (
    <Layout>
      <OverviewToolbar
        pilotInCharge="Shannon J."
        pilotOnCall="Bryan K."
        deployment={{ name: 'Overview', id: '0' }}
        onClickPilot={() => setGlobalModalId('reassign')}
      />
      <div className={styles.content}>
        <section className={styles.primary}>
          <MissionProgressToolbar
            startTime={startTime}
            endTime={endTime}
            ticks={6}
            ariaLabel="Mission Progress"
            className="bg-secondary-300/60"
          />
          <div className={styles.mapContainer}>
            <SharedPathContextProvider>
              <Map className="h-full w-full">
                {trackedVehicles.map((name) => (
                  <VehiclePath name={name} key={`path${name}`} grouped />
                ))}
              </Map>
            </SharedPathContextProvider>
          </div>
        </section>
        <section className={styles.secondary}>
          <VehicleList onSelectVehicle={handleSelectedVehicle} />
        </section>
      </div>
    </Layout>
  )
}

export default OverviewPage
