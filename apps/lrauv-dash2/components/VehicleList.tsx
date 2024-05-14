import {
  useVehicleInfo,
  useLastDeployment,
  useVehiclePos,
  useVehicles,
  usePlatforms,
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
import { capitalize } from '@mbari/utils'
import React, { useEffect } from 'react'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import axios from 'axios'
import { DateTime } from 'luxon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faSync } from '@fortawesome/free-solid-svg-icons'

const parsePos = (pos: string | number) => parseFloat(`${pos}`).toFixed(3)
const calcPosition = (lat?: number | string, long?: number | string) =>
  lat && long ? [parsePos(lat), parsePos(long)].join(', ') : undefined

const ConnectedVehicleCell: React.FC<{
  name: string
  color: string
  virtualizer: Virtualizer
  open: boolean
  onToggle: (open: boolean, name: string) => void
  onSelect: () => void
}> = ({
  name,
  virtualizer,
  color,
  open,
  onToggle: externalHandleToggle,
  onSelect: handleSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(open)
  const { data: lastDeployment } = useLastDeployment(
    {
      vehicle: name,
      to: new Date().toISOString(),
    },
    { staleTime: 5 * 60 * 1000 }
  )
  const { data: vehiclePosition, isLoading: positionLoading } = useVehiclePos(
    {
      vehicle: name,
      from: lastDeployment?.lastEvent
        ? DateTime.fromMillis(lastDeployment?.lastEvent).toISO()
        : '',
    },
    {
      enabled: !!lastDeployment?.lastEvent,
    }
  )
  const { data: vehicleInfo, isLoading: vehicleInfoLoading } = useVehicleInfo(
    { name },
    axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_HOST,
      timeout: 5000,
    })
  )
  const { data: missionStartedEvent } = useMissionStartedEvent(
    {
      vehicle: name,
    },
    {
      enabled: !!name && !!lastDeployment?.lastEvent,
    }
  )

  // TODO: Remove this demonstations of 'usePlatforms'
  const { data: platforms } = usePlatforms(
    { refresh: true },
    { baseUrl: process.env.NEXT_PUBLIC_ODSS2BASE_URL }
  )
  console.log('platforms', platforms)

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

  const status = lastDeployment?.recoverEvent
    ? 'Plugged in'
    : `Running ${mission ?? 'mission'}`
  const endDate = DateTime.fromMillis(lastDeployment?.endEvent?.unixTime ?? 0)

  const ended = lastDeployment?.endEvent?.eventId && true
  const recovered = lastDeployment?.recoverEvent?.eventId && true
  const active = lastDeployment?.active

  return (
    <>
      <VehicleHeader
        name={capitalize(name)}
        deployment={active ? lastDeployment?.name ?? 'loading' : 'Not Deployed'}
        color={color}
        deployedAt={
          active
            ? Math.round(
                (missionStartedEvent?.[0]?.unixTime ??
                  lastDeployment?.startEvent?.unixTime ??
                  0) / 1000
              )
            : undefined
        }
        onToggle={handleToggle}
        open={isOpen}
      />
      {isOpen && (
        <VehicleCell
          onSelect={handleSelect}
          headline={
            <div>
              <span className="font-semibold text-purple-600">{status}</span>{' '}
              {lastDeployment?.lastEvent
                ? DateTime.fromMillis(lastDeployment.lastEvent).toRelative()
                : ''}
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
            vehicle?.text_gpsago.length
              ? `${vehicle.text_gpsago}, likely on surface`
              : undefined
          }
          lastCell={
            vehicle?.text_cellago.length ? `${vehicle.text_cellago}` : undefined
          }
          vehicle={
            vehicle && {
              textAmpAgo: vehicle.text_ampago,
              textVehicle: vehicle.text_vehicle,
              textCell: vehicle.text_cell,
              colorCell: vehicle.color_cell,
              colorDirtbox: vehicle.color_dirtbox,
              textSpeed: vehicle.text_speed,
              textDvlStatus: vehicle.text_dvlstatus,
              textStationDist: vehicle.text_stationdist,
              textCommAgo: vehicle.text_commago,
              textNextComm: vehicle.text_nextcomm,
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
              textCellAgo: vehicle.text_cellago,
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
              textSat: vehicle.text_sat,
              textLogTime: vehicle.text_logtime,
              textMission: vehicle.text_mission ?? '',
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
              status: lastDeployment?.recoverEvent ? 'pluggedIn' : 'onMission',
              textLeak: vehicle.text_leak,
              textLeakAgo: vehicle.text_leakago,
              colorLeak: vehicle.color_leak,
              // colorCommAgo: 'st4',
              // textLeakago: '',
              // textFlowAgo: data.text_flowago,
              // textBearing: '94&#x00B0;',
              // colorUbat: 'st3',
              // colorBt2: 'st3',
              // colorBt1: 'st3',
              // colorLeak: 'st18',
            }
          }
        />
      )}
    </>
  )
}

const VehicleList: React.FC<{
  onSelectVehicle?: (vehicle: string) => void
}> = ({ onSelectVehicle: handleSelectVehicle }) => {
  const { trackedVehicles } = useTrackedVehicles()
  const vehicles = useVehicles({})
  const [accordionState, setAccordionState] = React.useState<{
    [key: string]: 'open' | 'closed' | undefined
  }>({})

  const handleToggle = (open: boolean, name: string) => {
    setAccordionState({
      ...accordionState,
      [name]: open ? 'open' : 'closed',
    })
  }

  const cellAtIndex = (index: number, virtualizer: Virtualizer) => {
    const color = vehicles.data?.find(
      (v) => v.vehicleName === trackedVehicles[index]
    )?.color
    const handleSelect = () => {
      handleSelectVehicle?.(trackedVehicles[index])
    }
    return (
      <div className="border-b border-stone-400">
        <ConnectedVehicleCell
          name={trackedVehicles[index]}
          virtualizer={virtualizer}
          color={color ?? '#ccc'}
          open={accordionState[trackedVehicles[index]] !== 'closed'}
          onToggle={handleToggle}
          onSelect={handleSelect}
        />
      </div>
    )
  }

  return (
    <CellVirtualizer
      cellAtIndex={cellAtIndex}
      count={trackedVehicles.length}
      className="w-full flex-shrink"
    />
  )
}

export default VehicleList
