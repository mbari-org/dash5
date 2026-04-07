import {
  useVehicleInfo,
  useLastDeployment,
  useVehiclePos,
  useSiteConfig,
  useMissionStartedEvent,
  GetVehicleInfoResponse,
} from '@mbari/api-client'
import {
  CellVirtualizer,
  VehicleCell,
  PluggedInIcon,
  VehicleHeader,
  Virtualizer,
} from '@mbari/react-ui'
import { useVehicleColors } from './VehicleColorsContext'
import {
  capitalize,
  formatCompactDuration,
  calculateRelativeNextComm,
  decodeHtmlEntities,
} from '@mbari/utils'
import React, { useEffect, useMemo } from 'react'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import axios from 'axios'
import { DateTime } from 'luxon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faSync } from '@fortawesome/free-solid-svg-icons'
import useGlobalModalId from '../lib/useGlobalModalId'
import { useTethysSubscriptionEvent } from '../lib/useWebSocketListeners'
import { useLastCommsTime } from '../lib/useLastCommsTime'
import { useNeedCommsTime } from '../lib/useNeedCommsTime'
import { useTick } from '../lib/useTick'

const parsePos = (pos: string | number) => parseFloat(`${pos}`).toFixed(3)
const calcPosition = (lat?: number | string, long?: number | string) =>
  lat && long ? [parsePos(lat), parsePos(long)].join(', ') : undefined

const ConnectedVehicleCellComponent: React.FC<{
  name: string
  color: string
  virtualizer: Virtualizer
  open: boolean
  onToggle: (open: boolean, name: string) => void
  onSelect: () => void
  onColorChange?: (color: string, vehicle: string) => void
}> = ({
  name,
  virtualizer,
  color,
  open,
  onToggle: externalHandleToggle,
  onSelect: handleSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(open)
  const { vehicleColors } = useVehicleColors()
  const contextColor = vehicleColors[name.toLowerCase()] || color
  const { data: lastDeployment } = useLastDeployment(
    {
      vehicle: name,
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const defaultFrom = useMemo(() => Date.now() - 24 * 60 * 60 * 1000, [])
  const { data: vehiclePosition, isLoading: positionLoading } = useVehiclePos(
    {
      vehicle: name,
      from: lastDeployment?.lastEvent ?? defaultFrom,
    },
    {
      enabled: !!lastDeployment?.lastEvent,
    }
  )

  const baseUrl = process.env.NEXT_PUBLIC_API_HOST
  const { data: vehicleInfo, isLoading: vehicleInfoLoading } = useVehicleInfo(
    { name },
    baseUrl
      ? axios.create({
          baseURL: baseUrl,
          timeout: 5000,
        })
      : undefined,
    {
      enabled: !!name,
      staleTime: 0,
      refetchInterval: 30 * 1000,
    }
  )
  const { data: missionStartedEvent } = useMissionStartedEvent(
    {
      vehicle: name,
      limit: 1,
    },
    {
      enabled: !!name && !!lastDeployment?.lastEvent,
    }
  )
  const pingEvent = useTethysSubscriptionEvent('VehiclePingResult', name)

  const mission = missionStartedEvent?.[0]?.text.replace(/started mission/i, '')
  const isLoading = positionLoading || vehicleInfoLoading

  const lastLoad = React.useRef(isLoading)
  useEffect(() => {
    if (lastLoad.current !== isLoading) {
      lastLoad.current = isLoading
    }
  }, [isLoading, virtualizer])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    externalHandleToggle(!isOpen, name)
  }

  const vehicle =
    vehicleInfo?.not_found || !vehicleInfo
      ? undefined
      : (vehicleInfo as GetVehicleInfoResponse)

  const deploymentStartTime = lastDeployment?.startEvent?.unixTime ?? 0

  const missionStartTime =
    missionStartedEvent?.[0]?.unixTime ?? deploymentStartTime

  const { lastSatCommsTime, lastCellCommsTime } = useLastCommsTime(
    name,
    deploymentStartTime
  )
  const { minutes: needCommsMinutes } = useNeedCommsTime(
    name,
    missionStartTime,
    {
      enabled: !!name && !!missionStartTime,
    }
  )
  const nowMs = useTick(60_000)
  const nowDT = DateTime.fromMillis(nowMs)

  const lastCellCommsDT = lastCellCommsTime
    ? DateTime.fromMillis(lastCellCommsTime)
    : null
  const lastSatCommsDT = lastSatCommsTime
    ? DateTime.fromMillis(lastSatCommsTime)
    : null

  const formattedCellTime = lastCellCommsDT
    ? lastCellCommsDT.toFormat('HH:mm')
    : vehicle?.text_cell
  const formattedCellAgo = lastCellCommsDT
    ? `${formatCompactDuration(lastCellCommsDT, nowDT, { maxDays: 6 })} ago`
    : vehicle?.text_cellago

  const formattedSatTime = lastSatCommsDT
    ? lastSatCommsDT.toFormat('HH:mm')
    : vehicle?.text_sat
  const formattedSatAgo = lastSatCommsDT
    ? `${formatCompactDuration(lastSatCommsDT, nowDT, { maxDays: 6 })} ago`
    : vehicle?.text_commago

  const { text: nextCommsText } = calculateRelativeNextComm(
    lastSatCommsTime,
    lastCellCommsTime,
    needCommsMinutes ?? 60,
    nowMs
  )
  const formattedNextComm = nextCommsText ?? vehicle?.text_nextcomm

  const vehicleProps = vehicle
    ? {
        textAmpAgo: vehicle.text_ampago,
        textVehicle: vehicle.text_vehicle,
        textCell: formattedCellTime,
        colorCell: vehicle.color_cell,
        colorDirtbox: vehicle.color_dirtbox,
        textSpeed: vehicle.text_speed,
        textDvlStatus: vehicle.text_dvlstatus,
        textStationDist: vehicle.text_stationdist,
        textCommAgo: formattedSatAgo,
        textNextComm: formattedNextComm,
        textCriticalError: vehicle.text_criticalerror,
        textTimeout: vehicle.text_timeout,
        colorSatComm: vehicle.color_satcomm,
        colorSmallCable: vehicle.color_smallcable,
        textNote: vehicle.text_note,
        textArriveStation: vehicle.text_arrivestation,
        colorMissionAgo: vehicle.color_missionago,
        textGps: vehicle.text_gps,
        colorGps: vehicle.color_gps,
        colorSw: vehicle.color_sw,
        textCurrentDist: vehicle.text_currentdist,
        textDroptime: vehicle.text_droptime,
        colorDrop: vehicle.color_drop,
        colorScheduled: vehicle.color_scheduled,
        colorHw: vehicle.color_hw,
        colorArrow: vehicle.color_arrow,
        colorGf: vehicle.color_gf,
        textGf: vehicle.text_gf,
        colorFlow: vehicle.color_flow,
        colorWavecolor: vehicle.color_wavecolor,
        textAmps: vehicle.text_amps,
        colorAmps: vehicle.color_amps,
        colorDvl: vehicle.color_dvl,
        textGpsAgo: vehicle.text_gpsago,
        textCellAgo: formattedCellAgo,
        textNoteTime: vehicle.text_notetime,
        textArrow: vehicle.text_arrow,
        colorBat1: vehicle.color_bat1,
        colorBat2: vehicle.color_bat2,
        colorBat3: vehicle.color_bat3,
        colorBat4: vehicle.color_bat4,
        colorBat5: vehicle.color_bat5,
        colorBat6: vehicle.color_bat6,
        colorBat7: vehicle.color_bat7,
        colorBat8: vehicle.color_bat8,
        colorCart: vehicle.color_cart,
        colorCartCircle: vehicle.color_cartcircle,
        colorThrust: vehicle.color_thrust,
        textSat: formattedSatTime,
        textLogTime: vehicle.text_logtime,
        textMission: vehicle.text_mission
          ? decodeHtmlEntities(vehicle.text_mission)
          : '',
        textReckonDistance: vehicle.text_reckondistance,
        textCriticalTime: vehicle.text_criticaltime,
        textGfTime: vehicle.text_gftime,
        textThrustTime: vehicle.text_thrusttime,
        textLogAgo: vehicle.text_logago,
        colorBigCable: vehicle.color_bigcable,
        textScheduled: vehicle.text_scheduled,
        textLastUpdate: vehicle.text_lastupdate,
        colorMissionDefault: vehicle.color_missiondefault,
        textVolts: vehicle.text_volts,
        colorVolts: vehicle.color_volts,
        status: (lastDeployment?.recoverEvent ? 'pluggedIn' : 'onMission') as
          | 'pluggedIn'
          | 'onMission',
        textLeak: vehicle.text_leak,
        textLeakAgo: vehicle.text_leakago,
        colorLeak: vehicle.color_leak,
      }
    : undefined

  const status = lastDeployment?.recoverEvent
    ? 'Plugged in'
    : `Running ${mission ?? 'mission'}`
  const endDate = DateTime.fromMillis(lastDeployment?.endEvent?.unixTime ?? 0)

  const ended = lastDeployment?.endEvent?.eventId && true
  const recovered = lastDeployment?.recoverEvent?.eventId && true
  const active = lastDeployment?.active

  const timeSpanSinceDeployment =
    DateTime.fromMillis(
      missionStartedEvent?.[0]?.unixTime ??
        lastDeployment?.startEvent?.unixTime ??
        0
    ).toRelative() ?? ''

  const timeSpanSinceRecovery =
    DateTime.fromMillis(
      lastDeployment?.recoverEvent?.unixTime ?? 0
    ).toRelative() ?? ''

  const { setGlobalModalId } = useGlobalModalId()
  const onColorChange = (_: string, _v: string) => {
    setGlobalModalId({ id: 'color', meta: { vehicleName: name, color } })
  }

  return (
    <>
      <VehicleHeader
        name={capitalize(name)}
        deployment={active ? lastDeployment?.name ?? 'loading' : 'Not Deployed'}
        color={contextColor} // Use context color here
        timeSpanSinceDeployment={active ? timeSpanSinceDeployment : undefined}
        onToggle={handleToggle}
        open={isOpen}
      />
      {isOpen && (
        <VehicleCell
          onSelect={handleSelect}
          headline={
            <div>
              <span className="font-semibold text-purple-600">{status}</span>{' '}
              {recovered ? timeSpanSinceRecovery : timeSpanSinceDeployment}
            </div>
          }
          headline2={
            ended ? (
              <div>
                Deployment{' '}
                <span className="font-semibold text-purple-600">
                  {lastDeployment?.name}
                </span>{' '}
                ended {endDate.toFormat('LLL dd, yyyy')}
              </div>
            ) : undefined
          }
          icon={
            recovered ? (
              <PluggedInIcon />
            ) : active ? (
              <FontAwesomeIcon icon={faSync} className="text-xl" />
            ) : (
              <FontAwesomeIcon icon={faCheck} className="text-xl" />
            )
          }
          lastPosition={calcPosition(
            vehiclePosition?.gpsFixes?.[0]?.latitude,
            vehiclePosition?.gpsFixes?.[0]?.longitude
          )}
          lastSatellite={
            vehicle?.text_gpsago?.length
              ? `${vehicle.text_gpsago}${
                  pingEvent?.reachable ? ', likely on surface' : ''
                }`
              : undefined
          }
          lastCell={
            formattedCellAgo
              ? `${formattedCellAgo}`
              : vehicle?.text_cellago?.length
              ? `${vehicle.text_cellago}`
              : undefined
          }
          vehicle={vehicleProps}
        />
      )}
    </>
  )
}

// No memoization - let it update when data changes
const ConnectedVehicleCell = ConnectedVehicleCellComponent

const VehicleList: React.FC<{
  onSelectVehicle?: (vehicle: string) => void
}> = ({ onSelectVehicle: handleSelectVehicle }) => {
  const { trackedVehicles } = useTrackedVehicles()
  const { data: siteConfig } = useSiteConfig()

  const [accordionState, setAccordionState] = React.useState<{
    [key: string]: 'open' | 'closed' | undefined
  }>({})

  const vehicles = siteConfig?.vehicleBasicInfos

  const { vehicleColors } = useVehicleColors()

  const handleToggle = (open: boolean, name: string) => {
    setAccordionState((prev) => ({
      ...prev,
      [name]: open ? 'open' : 'closed',
    }))
  }

  const cellAtIndex = (index: number, virtualizer: Virtualizer) => {
    const vehicleName = trackedVehicles[index]
    const vehicleColor =
      vehicleColors[vehicleName.toLowerCase()] ||
      vehicles?.find(
        (v: { vehicleName: string; color?: string }) =>
          v.vehicleName === vehicleName
      )?.color ||
      '#ccc'

    return (
      <div className="border-b border-stone-400">
        <div style={{ minHeight: '176px' }}>
          <ConnectedVehicleCell
            name={vehicleName}
            virtualizer={virtualizer}
            color={vehicleColor ?? '#ccc'}
            open={accordionState[vehicleName] !== 'closed'}
            onToggle={handleToggle}
            onSelect={() => handleSelectVehicle?.(vehicleName)}
          />
        </div>
      </div>
    )
  }

  // Force component to re-render when vehicleColors changes
  // This is crucial to ensure UI updates when colors change in modal
  React.useEffect(() => {
    // This effect depends on vehicleColors and will trigger a re-render
    // when they change in the VehicleColorsModal
  }, [vehicleColors])

  return (
    <CellVirtualizer
      cellAtIndex={cellAtIndex}
      count={trackedVehicles.length}
      className="w-full flex-shrink"
      style={{
        overflowY: 'scroll',
      }}
    />
  )
}

export default VehicleList
