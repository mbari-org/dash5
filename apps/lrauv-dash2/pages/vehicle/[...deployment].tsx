import { useEffect, useMemo, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import {
  Tab,
  TabGroup,
  DeploymentInfo,
  UnderwaterIcon,
  SurfacedIcon,
  ConnectedIcon,
  NotConnectedIcon,
  MissionProgressToolbar,
  OverviewToolbar,
  VehicleCommsCell,
  VehicleInfoCell,
} from '@mbari/react-ui'
import {
  useDeployments,
  useMissionStartedEvent,
  useTethysApiContext,
  useChartData,
  usePicAndOnCall,
  useEvents,
} from '@mbari/api-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/pro-solid-svg-icons'
import clsx from 'clsx'
import Layout from '../../components/Layout'
import VehicleDiagram from '../../components/VehicleDiagram'
import VehicleAccordion from '../../components/VehicleAccordion'
import useGlobalModalId from '../../lib/useGlobalModalId'
import useCurrentDeployment from '../../lib/useCurrentDeployment'
import { humanize } from '@mbari/utils'
import useGlobalDrawerState from '../../lib/useGlobalDrawerState'
import dynamic from 'next/dynamic'
import { useTethysSubscriptionEvent } from '../../lib/useWebSocketListeners'
import { useLastCommsTime } from '../../lib/useLastCommsTime'

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex w-3/4 flex-shrink flex-grow flex-col',
  mapContainer: 'flex flex-shrink flex-col flex-grow bg-blue-300 relative',
  secondary:
    'flex w-[438px] flex-shrink-0 flex-col bg-white border-t-2 border-t-secondary-300/60 border-l border-l-slate-300',
}

const LineChart = dynamic(
  () => import('@mbari/react-ui/dist/Charts/LineChart'),
  {
    ssr: false,
  }
)

const DeploymentMap = dynamic(() => import('../../components/DeploymentMap'), {
  ssr: false,
})

type AvailableTab = 'vehicle' | 'depth' | null

const Vehicle: NextPage = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    mounted || setMounted(true)
  }, [mounted, setMounted])

  const { drawerOpen, setDrawerOpen } = useGlobalDrawerState()
  const { authenticated } = useTethysApiContext()
  const { setGlobalModalId } = useGlobalModalId()
  const router = useRouter()
  const [currentTab, setTab] = useState<AvailableTab>('vehicle')
  const toggleDrawer = () => setDrawerOpen(!drawerOpen)
  const setCurrentTab = (tab: AvailableTab) => () => {
    setTab(tab)
    setDrawerOpen(true)
  }
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]
  const deploymentId = parseInt(params[1] ?? '0', 10)

  const { data: picAndOnCall, isLoading: loadingPic } = usePicAndOnCall({
    vehicleName,
  })
  const { deployment, isLoading } = useCurrentDeployment()
  const { data: deploymentsData } = useDeployments(
    {
      vehicle: vehicleName as string,
    },
    {
      enabled: !!vehicleName,
    }
  )

  const { data: missionStartedEvent } = useMissionStartedEvent(
    {
      vehicle: vehicleName as string,
    },
    {
      enabled: !!vehicleName && !!deployment?.lastEvent,
    }
  )

  useEffect(() => {
    if (!!deployment?.deploymentId && !deploymentId) {
      router.replace(`/vehicle/${vehicleName}/${deployment.deploymentId}`)
    }
  }, [deploymentId, deployment, vehicleName, router])

  const handleSelectDeployment = (selection: DeploymentInfo) =>
    router.push(`/vehicle/${vehicleName}/${selection.id}`)

  const deployments =
    deploymentsData?.map((dep) => ({
      id: `${dep.deploymentId}`,
      name: dep.name,
    })) ?? []

  const deploymentStartTime = deployment?.startEvent?.unixTime ?? 0
  const startTime =
    deployment?.active && missionStartedEvent?.[0]?.unixTime
      ? missionStartedEvent?.[0]?.unixTime
      : deploymentStartTime

  const endTime = deployment?.active
    ? DateTime.utc().plus({ hours: 4 }).endOf('day').toMillis()
    : deployment?.lastEvent ?? 0

  const lastCommsMillis = useLastCommsTime(vehicleName, startTime)
  const lastCommsTime = lastCommsMillis
    ? DateTime.fromMillis(lastCommsMillis)
    : null
  const nextCommsTime = lastCommsMillis
    ? DateTime.now().plus({
        milliseconds:
          DateTime.now().toMillis() -
          lastCommsMillis +
          25 * 60 * 1000 + // Replace with actual NeedsCommsInterval
          5 * 60 * 1000, // Replacee w/ buffer time
      })
    : null
  const handleClickPilot = () => setGlobalModalId({ id: 'reassign' })
  const handleNewDeployment = () => setGlobalModalId({ id: 'newDeployment' })
  const handleEditDeployment = () => setGlobalModalId({ id: 'editDeployment' })

  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
    isIdle: chartIdle,
  } = useChartData(
    {
      vehicle: vehicleName as string,
      from: DateTime.fromMillis(startTime).toISO(),
      to: endTime ? DateTime.fromMillis(endTime).toISO() : undefined,
    },
    {
      enabled: currentTab === 'depth' && startTime > 0,
    }
  )

  const depthData = chartData?.find((d) => d.name === 'depth')
  const chartAvailable =
    !!depthData && !chartLoading && !chartIdle && !chartError

  const depthChart = useMemo(() => {
    return chartAvailable ? (
      <LineChart
        name={depthData?.name ?? ''}
        data={depthData?.values.map((v, i) => ({
          value: v,
          timestamp: depthData.times[i],
        }))}
        yAxisLabel={`${humanize(depthData?.name)} (${depthData?.units})`}
        onHover={handleTimeScrub}
        inverted={depthData.name === 'depth'}
        className="h-[340px] w-full"
      />
    ) : null
  }, [depthData, chartAvailable])

  const [indicatorTime, setIndicatorTime] = useState<number | null | undefined>(
    null
  )
  const handleTimeScrub = (time?: number | null) => {
    setIndicatorTime(time)
  }
  const handleBatteryClick = () => {
    setGlobalModalId({ id: 'battery' })
  }

  const pingEvent = useTethysSubscriptionEvent('VehiclePingResult', vehicleName)

  return (
    <Layout>
      <OverviewToolbar
        vehicleName={vehicleName}
        pilotInCharge={picAndOnCall?.[0].pic?.user}
        pilotOnCall={picAndOnCall?.[0].onCall?.user}
        deployment={
          isLoading
            ? { name: '...', id: '0' }
            : {
                name: (deployment?.name ?? '...') as string,
                id: (deployment?.deploymentId as string) ?? '0',
                unixTime: deployment?.startEvent?.unixTime,
              }
        }
        onClickPilot={loadingPic ? undefined : handleClickPilot}
        supportIcon1={
          pingEvent?.reachable ? <ConnectedIcon /> : <NotConnectedIcon />
        }
        supportIcon2={
          pingEvent?.reachable ? <SurfacedIcon /> : <UnderwaterIcon />
        }
        onSelectNewDeployment={handleNewDeployment}
        deployments={deployments}
        onEditDeployment={handleEditDeployment}
        onSelectDeployment={handleSelectDeployment}
        onIcon1hover={() => (
          <VehicleCommsCell
            icon={
              pingEvent?.reachable ? <ConnectedIcon /> : <NotConnectedIcon />
            }
            headline={`Cell Comms: ${
              pingEvent?.reachable ? 'Connected' : 'Not Connected'
            }`}
            host={pingEvent?.hostName ?? 'Not available'}
            lastPing={
              ((pingEvent?.checkedAt &&
                DateTime.fromMillis(
                  pingEvent?.checkedAt
                ).toRelative()) as string) ?? 'Not available'
            }
            nextComms={`${nextCommsTime?.toFormat(
              'hh:mm'
            )} (in ${nextCommsTime?.toRelative()})`}
          />
        )}
        onIcon2hover={() => (
          <VehicleInfoCell
            icon={pingEvent?.reachable ? <SurfacedIcon /> : <UnderwaterIcon />}
            headline="Likely underwater"
            subtitle="Last comms over satellite"
            lastCommsOverSat={`${
              lastCommsTime?.day === DateTime.now().day
                ? 'Today'
                : lastCommsTime?.toFormat('mmm, d')
            } at ${lastCommsTime?.toFormat(
              'hh:mm:ss'
            )} (${lastCommsTime?.toRelative()})`}
            estimate={`Est. to surface in ${nextCommsTime?.toRelative()} at ~${nextCommsTime?.toFormat(
              'hh:mm'
            )}`}
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
            onScrub={handleTimeScrub}
            indicatorTime={indicatorTime}
          />
          <div className={styles.mapContainer}>
            <DeploymentMap
              vehicleName={vehicleName}
              indicatorTime={indicatorTime}
              startTime={startTime}
              endTime={endTime}
              onScrub={handleTimeScrub}
            />
            <div className="absolute bottom-0 z-[1001] flex w-full flex-col">
              <TabGroup className="w-full px-8">
                <Tab
                  onClick={toggleDrawer}
                  label={
                    <FontAwesomeIcon
                      icon={drawerOpen ? faChevronDown : faChevronUp}
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
                  drawerOpen ? 'h-80' : 'h-12'
                )}
              >
                {currentTab === 'vehicle' && (
                  <VehicleDiagram
                    name={vehicleName as string}
                    className="m-auto flex h-full w-full"
                    onBatteryClick={handleBatteryClick}
                  />
                )}
                {currentTab === 'depth' && (
                  <div className="flex h-full w-full overflow-hidden px-4">
                    {depthChart}
                    {chartLoading && (
                      <p className="text-md m-auto font-bold">
                        Loading Depth Data
                      </p>
                    )}
                    {chartError && (
                      <p className="text-md m-auto font-bold">
                        Depth Data Could Not Be Loaded
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className={styles.secondary}>
          {deployment && (
            <VehicleAccordion
              authenticated={authenticated}
              vehicleName={vehicleName}
              from={DateTime.fromMillis(deploymentStartTime)
                .minus({ days: deployment.active ? 1 : 0 })
                .toISO()}
              to={DateTime.fromMillis(endTime).toISO()}
              activeDeployment={deployment.active}
              currentDeploymentId={deployment.deploymentId as number}
            />
          )}
        </section>
      </div>
    </Layout>
  )
}

export default Vehicle
