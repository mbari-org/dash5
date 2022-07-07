import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { DateTime } from 'luxon'
import {
  Tab,
  TabGroup,
  CommsIcon,
  DeploymentInfo,
  StatusIcon,
  UnderwaterIcon,
  ConnectedIcon,
  MissionProgressToolbar,
  OverviewToolbar,
  VehicleCommsCell,
  VehicleInfoCell,
} from '@mbari/react-ui'
import {
  useLastDeployment,
  useDeployments,
  useMissionStartedEvent,
  useTethysApiContext,
} from '@mbari/api-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/pro-solid-svg-icons'
import clsx from 'clsx'
import Layout from '../../components/Layout'
import VehicleDiagram from '../../components/VehicleDiagram'
import VehicleAccordion from '../../components/VehicleAccordion'
import useGlobalModalId from '../../lib/useGlobalModalId'

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex w-3/4 flex-shrink flex-grow flex-col',
  mapContainer: 'flex flex-shrink flex-col flex-grow bg-blue-300 relative',
  secondary:
    'flex w-[438px] flex-shrink-0 flex-col bg-white border-t-2 border-t-secondary-300/60 border-l border-l-slate-300',
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
  const { authenticated } = useTethysApiContext()
  const { setGlobalModalId } = useGlobalModalId()
  const router = useRouter()
  const [currentTab, setTab] = useState<AvailableTab>('vehicle')
  const toggleDrawer = () => setDrawer(!drawer)
  const setCurrentTab = (tab: AvailableTab) => () => {
    setTab(tab)
    setDrawer(true)
  }
  const { deployment } = router.query
  const params = (deployment ?? []) as string[]
  const vehicleName = params[0]
  const deploymentId = params[1]
  const [drawer, setDrawer] = useState(false)

  const { data: lastDeployment, isLoading } = useLastDeployment(
    {
      vehicle: vehicleName as string,
      to: new Date().toISOString(),
    },
    { staleTime: 5 * 60 * 1000, enabled: !!vehicleName && !deploymentId }
  )
  const { data: deploymentData } = useDeployments(
    {
      vehicle: vehicleName as string,
    },
    { staleTime: 5 * 60 * 1000, enabled: !!vehicleName }
  )

  const { data: missionStartedEvent } = useMissionStartedEvent(
    {
      vehicle: vehicleName as string,
    },
    {
      enabled: !!vehicleName && !!lastDeployment?.lastEvent,
    }
  )

  const handleSelectDeployment = (selection: DeploymentInfo) =>
    router.push(`/vehicle/${vehicleName}/${selection.id}`)

  const deployments =
    deploymentData?.map((dep) => ({
      id: `${dep.deploymentId}`,
      name: dep.name,
    })) ?? []

  const selectedDeployment = deploymentId
    ? deploymentData?.find((dep) => `${dep.deploymentId}` === `${deploymentId}`)
    : lastDeployment

  const startTime =
    selectedDeployment?.active && missionStartedEvent?.[0]?.unixTime
      ? missionStartedEvent?.[0]?.unixTime
      : selectedDeployment?.startEvent?.unixTime ?? 0
  const endTime = selectedDeployment?.active
    ? DateTime.utc().plus({ hours: 4 }).toMillis()
    : selectedDeployment?.lastEvent ?? 0

  const handleClickPilot = () => setGlobalModalId('reassign')

  return (
    <Layout>
      <OverviewToolbar
        vehicleName={vehicleName}
        pilotInCharge="Shannon J."
        pilotOnCall="Bryan K."
        deployment={
          isLoading
            ? { name: '...', id: '0' }
            : {
                name: (selectedDeployment?.name ?? '...') as string,
                id: (selectedDeployment?.deploymentId as string) ?? '0',
                unixTime: selectedDeployment?.startEvent?.unixTime,
              }
        }
        onClickPilot={handleClickPilot}
        supportIcon1={<CommsIcon />}
        supportIcon2={<StatusIcon />}
        onSelectNewDeployment={() => undefined}
        deployments={deployments}
        onSelectDeployment={handleSelectDeployment}
        onIcon1hover={() => (
          <VehicleCommsCell
            icon={<ConnectedIcon />}
            headline="Cell Comms: Connected"
            host="lrauv-brizo-cell.shore.mbari.org"
            lastPing="Today at 14:40:36 (3s ago)"
            nextComms="14:55 (in 15m)"
            onSelect={() => {
              console.log('event fired')
            }}
          />
        )}
        onIcon2hover={() => (
          <VehicleInfoCell
            icon={<UnderwaterIcon />}
            headline="Likely underwater"
            subtitle="Last confirmed on surface 47min ago"
            lastCommsOverSat="Today at 14:08:36 (47m ago)"
            estimate="Est. to surface in 15 mins at ~14:55"
            onSelect={() => {
              console.log('event fired')
            }}
          />
        )}
      />
      <div className={styles.content}>
        <section className={styles.primary}>
          <MissionProgressToolbar
            startTime={DateTime.fromMillis(startTime).toISO()}
            endTime={DateTime.fromMillis(endTime).toISO()}
            ticks={6}
            ariaLabel="Mission Progress"
            className="bg-secondary-300/60"
          />
          <div className={styles.mapContainer}>
            <Map className="h-full w-full" maxZoom={13}>
              <VehiclePath
                name={vehicleName as string}
                from={startTime}
                to={endTime}
              />
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
                    name={vehicleName as string}
                    className="m-auto flex h-full w-full max-w-[900px]"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        <section className={styles.secondary}>
          {selectedDeployment && (
            <VehicleAccordion
              authenticated={authenticated}
              vehicleName={vehicleName}
              from={DateTime.fromMillis(startTime).toISO()}
              to={DateTime.fromMillis(endTime).toISO()}
              activeDeployment={selectedDeployment.active}
            />
          )}
        </section>
      </div>
    </Layout>
  )
}

export default Vehicle
