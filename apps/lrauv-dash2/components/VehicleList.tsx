import { useVehicleInfo } from '@mbari/api-client'
import { CellVirtualizer, VehicleCell, PluggedInIcon } from '@mbari/react-ui'
import React from 'react'
import useTrackedVehicles from '../lib/useTrackedVehicles'
import axios from 'axios'

const ConnectedVehicleCell: React.FC<{ name: string }> = ({ name }) => {
  const { data } = useVehicleInfo(
    { name },
    axios.create({
      baseURL: '//localhost:3002',
      timeout: 5000,
    })
  )

  return (
    <VehicleCell
      headline={
        <div>
          <span className="font-semibold text-purple-600">Plugged in</span> for
          17 days 8 hours
        </div>
      }
      headline2={
        <div>
          Deployment{' '}
          <span className="font-semibold text-purple-600">
            Aku 14 Falkor leg 2
          </span>{' '}
          ended April 3, 2018
        </div>
      }
      icon={<PluggedInIcon />}
      vehicle={
        data && {
          textAmpAgo: data.text_ampago,
          textVehicle: data.text_vehicle,
          textCell: data.text_cell,
          colorCell: data.color_cell,
          colorDirtbox: data.color_dirtbox,
          textSpeed: data.text_speed,
          textDvlStatus: data.text_dvlstatus,
          textStationDist: data.text_stationdist,
          textCommAgo: data.color_commago,
          textNextComm: data.text_nextcomm,
          textCriticalError: data.text_criticalerror,
          textTimeout: data.text_timeout,
          colorSatComm: data.color_satcomm,
          colorSmallCable: data.color_smallcable,
          textNote: data.text_note,
          textArriveStation: data.text_arrivestation,
          colorMissionAgo: data.color_missionago,
          textGps: data.text_gps,
          colorGps: data.color_gps,
          colorSw: data.color_sw,
          textCurrentDist: data.text_currentdist,
          textDroptime: data.text_droptime,
          colorDrop: data.color_drop,
          colorScheduled: data.color_scheduled,
          colorHw: data.color_hw,
          colorArrow: data.color_arrow,
          colorGf: data.color_gf,
          textGf: data.text_gf,
          colorFlow: data.color_flow,
          colorWavecolor: data.color_wavecolor,
          textAmps: data.text_amps,
          colorAmps: data.color_amps,
          colorDvl: data.color_dvl,
          textGpsAgo: data.text_gpsago,
          textCellAgo: data.text_cellago,
          textNoteTime: data.text_notetime,
          textArrow: data.text_arrow,
          colorBat1: data.color_bat1,
          colorBat2: data.color_bat2,
          colorBat3: data.color_bat3,
          colorBat4: data.color_bat4,
          colorBat5: data.color_bat5,
          colorBat6: data.color_bat6,
          colorBat7: data.color_bat7,
          colorBat8: data.color_bat8,
          colorCart: data.color_cart,
          colorCartCircle: data.color_cartcircle,
          colorThrust: data.color_thrust,
          textSat: data.text_sat,
          textLogTime: data.text_logtime,
          textMission: data.text_mission,
          textReckonDistance: data.text_reckondistance,
          textCriticalTime: data.text_criticaltime,
          textGfTime: data.text_gftime,
          textThrustTime: data.text_thrusttime,
          textLogAgo: data.text_logago,
          colorBigCable: data.color_bigcable,
          textScheduled: data.text_scheduled,
          textLastUpdate: data.text_lastupdate,
          colorMissionDefault: data.color_missiondefault,
          textVolts: data.text_volts,
          colorVolts: data.color_volts,
          status: 'onMission',
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
  )
}

const VehicleList: React.FC = () => {
  const { trackedVehicles } = useTrackedVehicles()
  const cellAtIndex = (index: number) => (
    <div className="border-b border-stone-400">
      <ConnectedVehicleCell name={trackedVehicles[index]} />
    </div>
  )
  return (
    <CellVirtualizer
      cellAtIndex={cellAtIndex}
      count={trackedVehicles.length}
      className="w-full flex-shrink"
    />
  )
}

export default VehicleList
