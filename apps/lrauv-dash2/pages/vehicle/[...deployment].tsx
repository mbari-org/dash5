import { useEffect, useMemo, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import {
  getAdjustedUnixTime,
  humanize,
  createRoleLabel,
  calculateRelativeNextComm,
} from '@mbari/utils'

import {
  Tab,
  TabGroup,
  DeploymentInfo,
  ConnectedIcon,
  NotConnectedIcon,
  MissionProgressToolbar,
  OverviewToolbar,
  VehicleCommsCell,
  VehicleInfoCell,
} from '@mbari/react-ui'
import {
  useDeployments,
  useTethysApiContext,
  useChartData,
  useVehiclePicAndOnCall,
  useMissionStartedEvent,
} from '@mbari/api-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import Layout from '../../components/Layout'
import VehicleDiagram from '../../components/VehicleDiagram'
import VehicleAccordion from '../../components/VehicleAccordion'
import useGlobalModalId from '../../lib/useGlobalModalId'
import useCurrentDeployment from '../../lib/useCurrentDeployment'
import useGlobalDrawerState from '../../lib/useGlobalDrawerState'
import dynamic from 'next/dynamic'
import { useLastCommsTime } from '../../lib/useLastCommsTime'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { useGoogleMaps } from '../../lib/useGoogleMaps'
import { SelectedStationsProvider } from '../../components/SelectedStationContext'
import { MapCameraProvider } from '../../components/MapCameraContext'
import { SelectedPolygonsProvider } from '../../components/SelectedPolygonsContext'
import { SelectedTileLayersProvider } from '../../components/SelectedTileLayersContext'
import { SelectedKmlLayersProvider } from '../../components/SelectedKmlLayersContext'
import { SelectedPlatformsProvider } from '../../components/SelectedPlatformContext'
import { useNeedCommsTime } from '../../lib/useNeedCommsTime'
import { useTick } from '../../lib/useTick'
import { useVehicleStatus } from '../../lib/useVehicleStatus'
import { vehiclePhysicalStatusIcon } from '../../lib/vehiclePhysicalStatusIcon'

// Every flex parent of the map needs `min-h-0`
// Without it, Leaflet sometimes shows gray tiles

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden min-h-0',
  primary: 'flex h-full flex-shrink flex-grow flex-col min-h-0',
  mapContainer:
    'flex flex-shrink flex-col flex-grow bg-blue-300 relative h-full min-h-0',
  secondary:
    'flex w-full h-full flex-shrink-0 flex-col bg-white border-t-2 border-t-secondary-300/60 border-l border-l-slate-300 min-h-0',
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
type MobileView = 'main' | 'sidebar'

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

const Vehicle: NextPage = () => {
  const { authenticated, loading: authLoading } = useTethysApiContext()
  const { mapsLoaded } = useGoogleMaps()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    mounted || setMounted(true)
  }, [mounted, setMounted])

  const { drawerOpen, setDrawerOpen } = useGlobalDrawerState()
  const { setGlobalModalId } = useGlobalModalId()
  const router = useRouter()
  const [currentTab, setTab] = useState<AvailableTab>('vehicle')
  const toggleDrawer = () => setDrawerOpen(!drawerOpen)
  const setCurrentTab = (tab: AvailableTab) => () => {
    setTab(tab)
    setDrawerOpen(true)
  }

  const [mobileView, setMobileView] = useState<MobileView>('main')
  const isDesktop = useIsDesktop()

  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]
  const deploymentId = parseInt(params[1] ?? '0', 10)

  const { deployment, lastDeployment, isLoading } = useCurrentDeployment()
  const { data: deploymentsData } = useDeployments(
    {
      vehicle: vehicleName as string,
    },
    {
      enabled: !!vehicleName,
    }
  )

  const { data, isLoading: loadingPicAndOnCall } = useVehiclePicAndOnCall(
    {
      vehicleName,
    },
    {
      enabled: !!vehicleName && authenticated,
    }
  )

  const { profile } = useTethysApiContext()
  const currentUserName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : ''

  const pics = data?.[0]?.pics.map((p) => p.user)
  const onCalls = data?.[0]?.onCalls.map((o) => o.user)

  const picLabel = pics?.length
    ? createRoleLabel({
        operators: pics,
        role: 'PIC',
        currentUser: currentUserName,
        authenticated,
        loading: loadingPicAndOnCall || authLoading,
      })
    : ''
  const onCallLabel = onCalls?.length
    ? createRoleLabel({
        operators: onCalls,
        role: 'On-Call',
        currentUser: currentUserName,
        authenticated,
        loading: loadingPicAndOnCall || authLoading,
      })
    : ''

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

  const startTime = deployment?.startEvent?.unixTime ?? 0

  const adjustedDeploymentStartTime = getAdjustedUnixTime({
    unixTime: startTime,
    offsetDays: deployment?.active ? -1 : 0,
  })

  const endTime = deployment?.active
    ? DateTime.utc().plus({ hours: 4 }).endOf('day').toMillis()
    : deployment?.endEvent?.unixTime ?? 0

  // Get the actual mission start time (e.g., ballast_and_trim, transit, etc.)
  // instead of deployment start time
  const { data: missionStartedEvent } = useMissionStartedEvent(
    {
      vehicle: vehicleName as string,
      limit: 1,
    },
    {
      enabled: !!vehicleName && !!deployment,
      staleTime: 60 * 1000,
    }
  )
  const missionStartTime = missionStartedEvent?.[0]?.unixTime ?? startTime

  const { lastSatCommsTime, lastCellCommsTime } = useLastCommsTime(
    vehicleName,
    startTime
  )
  const lastSatCommsDT = lastSatCommsTime
    ? DateTime.fromMillis(lastSatCommsTime)
    : null
  const lastCellCommsDT = lastCellCommsTime
    ? DateTime.fromMillis(lastCellCommsTime)
    : null

  const { minutes: needCommsMinutes } = useNeedCommsTime(
    vehicleName,
    missionStartTime,
    { enabled: !!vehicleName && !!missionStartTime }
  )
  const nowMs = useTick(60_000)
  const { nextCommTimeMs, text: nextCommsText } = useMemo(
    () =>
      calculateRelativeNextComm(
        lastSatCommsTime,
        lastCellCommsTime,
        needCommsMinutes ?? 60,
        nowMs
      ),
    [lastSatCommsTime, lastCellCommsTime, needCommsMinutes, nowMs]
  )
  const nextCommsTime = nextCommTimeMs
    ? DateTime.fromMillis(nextCommTimeMs)
    : null

  const {
    pingEvent,
    cellPingReachable,
    isPluggedIn,
    isLikelySurfaced,
    physicalStatus,
  } = useVehicleStatus({
    vehicleName,
    lastSatCommsTime,
    lastCellCommsTime,
    nowMs,
    recoverEvent: lastDeployment?.recoverEvent,
    startEventUnix: lastDeployment?.startEvent?.unixTime,
  })

  const isRecovered = Boolean(lastDeployment?.recoverEvent)
  const recoveredAt = lastDeployment?.recoverEvent?.unixTime
    ? DateTime.fromMillis(lastDeployment.recoverEvent.unixTime).toRelative() ??
      undefined
    : undefined
  const handleRoleReassign = () => setGlobalModalId({ id: 'reassign' })
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
      from: startTime,
      to: endTime ? endTime : undefined,
    },
    {
      enabled: currentTab === 'depth' && startTime > 0,
    }
  )

  const depthData = chartData?.find((d) => d.name === 'depth')
  const chartAvailable =
    !!depthData && !chartLoading && !chartIdle && !chartError

  const [indicatorTime, setIndicatorTime] = useState<number | null | undefined>(
    null
  )
  const handleTimeScrub = (time?: number | null) => {
    setIndicatorTime(time)
  }

  const depthChart = useMemo(() => {
    return chartAvailable ? (
      <LineChart
        name={depthData?.name ?? ''}
        data={depthData?.values?.map((v, i) => ({
          value: v,
          timestamp: depthData?.times?.[i],
        }))}
        yAxisLabel={`${humanize(depthData?.name)} (${depthData?.units})`}
        onHover={handleTimeScrub}
        inverted={depthData?.name === 'depth'}
        className="h-[340px] w-full"
      />
    ) : null
  }, [depthData, chartAvailable])

  const handleBatteryClick = () => {
    setGlobalModalId({ id: 'battery' })
  }

  const vehicleStatusIcon = vehiclePhysicalStatusIcon(physicalStatus)

  const primarySection = (
    <section className={styles.primary}>
      <MissionProgressToolbar
        startTime={DateTime.fromMillis(startTime).toISO()}
        endTime={DateTime.fromMillis(endTime).toISO()}
        ticks={6}
        ariaLabel="Mission Progress"
        className="min-h-0 bg-secondary-300/60"
        onScrub={handleTimeScrub}
        indicatorTime={indicatorTime}
      />
      <div className={styles.mapContainer}>
        {mapsLoaded && (
          <DeploymentMap
            vehicleName={vehicleName}
            indicatorTime={indicatorTime}
            startTime={startTime}
            endTime={endTime}
            onScrub={handleTimeScrub}
          />
        )}
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
                lastCellCommsTime={lastCellCommsDT}
                lastSatCommsTime={lastSatCommsDT}
                nextCommsText={nextCommsText}
              />
            )}
            {currentTab === 'depth' && (
              <div className="flex h-full w-full overflow-hidden px-4">
                {depthChart}
                {chartLoading && (
                  <p className="text-md m-auto font-bold">Loading Depth Data</p>
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
  )

  const secondarySection = (
    <section className={styles.secondary}>
      {deployment && (
        <VehicleAccordion
          authenticated={authenticated}
          vehicleName={vehicleName}
          from={adjustedDeploymentStartTime}
          to={endTime}
          picLabel={picLabel}
          onCallLabel={onCallLabel}
          activeDeployment={deployment.active}
          currentDeploymentId={deployment.deploymentId as number}
          isRecovered={isRecovered}
        />
      )}
    </section>
  )

  return (
    <SelectedPlatformsProvider>
      <SelectedStationsProvider>
        <MapCameraProvider>
          <SelectedPolygonsProvider>
            <SelectedTileLayersProvider>
              <SelectedKmlLayersProvider>
                <div className={styles.content}>
                  <Layout>
                    <OverviewToolbar
                      vehicleName={vehicleName}
                      currentUserName={currentUserName}
                      pics={pics}
                      onCalls={onCalls}
                      deployment={
                        isLoading
                          ? { name: '...', id: '0' }
                          : {
                              name: (deployment?.name ?? '...') as string,
                              id: (deployment?.deploymentId as string) ?? '0',
                              unixTime: deployment?.startEvent?.unixTime,
                            }
                      }
                      onRoleReassign={handleRoleReassign}
                      loadingPicAndOnCall={loadingPicAndOnCall || authLoading}
                      recovered={isRecovered}
                      recoveredAt={recoveredAt}
                      supportIcon1={
                        cellPingReachable ? (
                          <ConnectedIcon />
                        ) : (
                          <NotConnectedIcon />
                        )
                      }
                      supportIcon2={vehicleStatusIcon}
                      onSelectNewDeployment={handleNewDeployment}
                      deployments={deployments}
                      onEditDeployment={handleEditDeployment}
                      onSelectDeployment={handleSelectDeployment}
                      onIcon1hover={() => (
                        <VehicleCommsCell
                          icon={
                            cellPingReachable ? (
                              <ConnectedIcon />
                            ) : (
                              <NotConnectedIcon />
                            )
                          }
                          headline={`Cell Comms: ${
                            cellPingReachable ? 'Connected' : 'Not Connected'
                          }`}
                          host={pingEvent?.hostName ?? 'Not available'}
                          lastPing={
                            ((pingEvent?.checkedAt &&
                              DateTime.fromMillis(
                                pingEvent?.checkedAt
                              ).toRelative()) as string) ?? 'Not available'
                          }
                          nextComms={nextCommsText ?? undefined}
                        />
                      )}
                      onIcon2hover={() => (
                        <VehicleInfoCell
                          isPluggedIn={isPluggedIn}
                          isReachable={isLikelySurfaced}
                          nextCommsTime={nextCommsTime}
                          lastPluggedInTime={
                            lastDeployment?.recoverEvent?.unixTime
                              ? DateTime.fromMillis(
                                  lastDeployment.recoverEvent.unixTime
                                )
                              : null
                          }
                          lastSatCommsTime={lastSatCommsDT}
                          lastCellCommsTime={lastCellCommsDT}
                        />
                      )}
                      authenticated={authenticated}
                    />

                    {/* Single map instance: render one layout to avoid duplicate controls */}
                    {isDesktop ? (
                      <div className="flex min-h-0 flex-1">
                        <div className={styles.content}>
                          <Allotment
                            separator
                            defaultSizes={[75, 25]}
                            className="min-h-0"
                          >
                            <Allotment.Pane minSize={720}>
                              {primarySection}
                            </Allotment.Pane>
                            <Allotment.Pane minSize={512}>
                              {secondarySection}
                            </Allotment.Pane>
                          </Allotment>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
                          <button
                            type="button"
                            onClick={() => setMobileView('main')}
                            className={clsx(
                              'rounded px-3 py-1 text-sm font-bold',
                              mobileView === 'main'
                                ? 'bg-secondary-300/60 text-black'
                                : 'text-slate-600'
                            )}
                          >
                            Map
                          </button>
                          <button
                            type="button"
                            onClick={() => setMobileView('sidebar')}
                            className={clsx(
                              'rounded px-3 py-1 text-sm font-bold',
                              mobileView === 'sidebar'
                                ? 'bg-secondary-300/60 text-black'
                                : 'text-slate-600'
                            )}
                          >
                            Details
                          </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-hidden">
                          {mobileView === 'main'
                            ? primarySection
                            : secondarySection}
                        </div>
                      </div>
                    )}
                  </Layout>
                </div>
              </SelectedKmlLayersProvider>
            </SelectedTileLayersProvider>
          </SelectedPolygonsProvider>
        </MapCameraProvider>
      </SelectedStationsProvider>
    </SelectedPlatformsProvider>
  )
}

export default Vehicle
