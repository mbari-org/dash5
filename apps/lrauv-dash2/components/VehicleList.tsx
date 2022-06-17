import {
  useVehicleInfo,
  useLastDeployment,
  useVehicles,
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

const ConnectedVehicleCell: React.FC<{
  name: string
  color: string
  virtualizer: Virtualizer
  open: boolean
  onToggle: (open: boolean, name: string) => void
}> = ({ name, virtualizer, color, open, onToggle: externalHandleToggle }) => {
  const [isOpen, setIsOpen] = React.useState(open)
  const lastDeployment = useLastDeployment({
    vehicle: name,
    to: new Date().toISOString(),
  })
  const { data, isLoading } = useVehicleInfo(
    { name },
    axios.create({
      baseURL: '//localhost:3002',
      timeout: 5000,
    })
  )

  const lastLoad = React.useRef(isLoading)
  useEffect(() => {
    if (lastLoad.current !== isLoading) {
      virtualizer.measure()
      lastLoad.current = isLoading
    }
  }, [isLoading, data, virtualizer])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    externalHandleToggle(!isOpen, name)
    virtualizer.measure()
  }

  const vehicle =
    data?.not_found || !data ? null : (data as GetVehicleInfoResponse)

  return (
    <>
      <VehicleHeader
        name={capitalize(name)}
        deployment={lastDeployment.data?.name ?? 'Not Deployed'}
        color={color}
        deployedAt={Math.round(
          (lastDeployment.data?.startEvent?.unixTime ?? 0) / 1000
        )}
        onToggle={handleToggle}
        open={isOpen}
      />
      {isOpen && (
        <VehicleCell
          headline={
            <div>
              <span className="font-semibold text-purple-600">
                {lastDeployment.data?.active
                  ? `Running ${lastDeployment.data?.launchEvent?.eventId}`
                  : 'Plugged in'}
              </span>{' '}
              for 17 days 8 hours
            </div>
          }
          headline2={
            <div>
              Deployment{' '}
              <span className="font-semibold text-purple-600">
                {lastDeployment.data?.name}
              </span>{' '}
              ended April 3, 2018
            </div>
          }
          icon={<PluggedInIcon />}
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
              textCommAgo: vehicle.color_commago,
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
              status: lastDeployment.data?.active ? 'onMission' : 'recovered',
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

const VehicleList: React.FC = () => {
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
    return (
      <div className="border-b border-stone-400">
        <ConnectedVehicleCell
          name={trackedVehicles[index]}
          virtualizer={virtualizer}
          color={color ?? '#ccc'}
          open={accordionState[trackedVehicles[index]] !== 'closed'}
          onToggle={handleToggle}
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
