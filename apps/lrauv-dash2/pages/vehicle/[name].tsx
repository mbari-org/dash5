import { MissionProgressToolbar, OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

import Layout from '../../components/Layout'
import VehicleDiagram from '../../components/VehicleDiagram'
import dynamic from 'next/dynamic'
import { DateTime } from 'luxon'
import { Tab, TabGroup } from '@mbari/react-ui'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/pro-solid-svg-icons'
import clsx from 'clsx'
import { useLastDeployment } from '@mbari/api-client'

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex w-3/4 flex-shrink flex-grow flex-col',
  mapContainer: 'flex flex-shrink flex-col flex-grow bg-blue-300 relative',
  secondary:
    'flex w-[438px] flex-shrink-0 flex-col bg-white border-t-2 border-secondary-300/60',
}

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})
const VehiclePath = dynamic(() => import('../../components/VehiclePath'), {
  ssr: false,
})

type AvailableTab = 'vehicle' | 'depth' | null

const Vehicle: NextPage = () => {
  const router = useRouter()
  const startTime = DateTime.utc().minus({ weeks: 1 }).toISO()
  const endTime = DateTime.utc().plus({ days: 4 }).toISO()
  const [currentTab, setTab] = useState<AvailableTab>('vehicle')
  const toggleDrawer = () => setDrawer(!drawer)
  const setCurrentTab = (tab: AvailableTab) => () => setTab(tab)
  const { name } = router.query
  const [drawer, setDrawer] = useState(false)

  const [selectDeployment, setSelectDeployment] = useState(false)
  const toggleDeployment = () => {
    setSelectDeployment(!selectDeployment)
  }
  const { data, isLoading } = useLastDeployment(
    {
      vehicle: name as string,
      to: new Date().toISOString(),
    },
    { staleTime: 5 * 60 * 1000, enabled: !!name }
  )
  return (
    <Layout>
      <OverviewToolbar
        pilotInCharge="Shannon J."
        pilotOnCall="Bryan K."
        deployment={isLoading ? '...' : data?.name ?? 'Unknown'}
        onClickPilot={() => undefined}
        onClickDeployment={toggleDeployment}
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
            <Map className="h-full w-full">
              <VehiclePath name={name as string} />
            </Map>
            <div className="absolute bottom-0 z-[1001] flex w-full flex-col">
              <TabGroup className="w-full px-8">
                <Tab
                  onClick={toggleDrawer}
                  label={
                    <FontAwesomeIcon
                      icon={drawer ? faChevronDown : faChevronUp}
                      size="1x"
                    />
                  }
                  selected
                  className="mr-auto"
                />
                <Tab
                  label="Vehicle State"
                  onClick={setCurrentTab('vehicle')}
                  selected={currentTab === 'vehicle'}
                />
                <Tab
                  label="Depth Data"
                  onClick={setCurrentTab('depth')}
                  selected={currentTab === 'depth'}
                  className="mr-auto"
                />
              </TabGroup>
              <div
                className={clsx(
                  'flex w-full bg-white',
                  drawer ? 'h-80' : 'h-12'
                )}
              >
                {currentTab === 'vehicle' && (
                  <VehicleDiagram
                    name={name as string}
                    className="m-auto flex h-full w-full max-w-[900px]"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        <section className={styles.secondary}>
          <p className="m-2 rounded bg-yellow-100 p-4 text-orange-500">
            [TODO]: Accordion Control for Vehicle Details
          </p>
        </section>
      </div>
    </Layout>
  )
}

export default Vehicle
