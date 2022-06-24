import {
  useVehicleInfo,
  GetVehicleInfoResponse,
  useLastDeployment,
} from '@mbari/api-client'
import React from 'react'
import axios from 'axios'
import { Vehicle } from '@mbari/react-ui'

const VehicleDiagram: React.FC<{
  name: string
  className?: string
  style?: React.CSSProperties
}> = ({ name, className, style }) => {
  const { data: vehicleInfo } = useVehicleInfo(
    { name },
    axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_HOST,
      timeout: 5000,
    })
  )

  const lastDeployment = useLastDeployment(
    {
      vehicle: name,
      to: new Date().toISOString(),
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const vehicle =
    vehicleInfo?.not_found || !vehicleInfo
      ? undefined
      : (vehicleInfo as GetVehicleInfoResponse)

  return vehicle ? (
    <div className={className} style={style}>
      <Vehicle
        className="m-auto h-auto w-full"
        textAmpAgo={vehicle.text_ampago}
        textVehicle={vehicle.text_vehicle}
        textCell={vehicle.text_cell}
        colorCell={vehicle.color_cell}
        colorDirtbox={vehicle.color_dirtbox}
        textSpeed={vehicle.text_speed}
        textDvlStatus={vehicle.text_dvlstatus}
        textStationDist={vehicle.text_stationdist}
        textCommAgo={vehicle.color_commago}
        textNextComm={vehicle.text_nextcomm}
        textCriticalError={vehicle.text_criticalerror}
        textTimeout={vehicle.text_timeout}
        colorSatComm={vehicle.color_satcomm}
        colorSmallCable={vehicle.color_smallcable}
        textNote={vehicle.text_note}
        textArriveStation={vehicle.text_arrivestation}
        colorMissionAgo={vehicle.color_missionago}
        textGps={vehicle.text_gps}
        colorGps={vehicle.color_gps}
        colorSw={vehicle.color_sw}
        textCurrentDist={vehicle.text_currentdist}
        textDroptime={vehicle.text_droptime}
        colorDrop={vehicle.color_drop}
        colorScheduled={vehicle.color_scheduled}
        colorHw={vehicle.color_hw}
        colorArrow={vehicle.color_arrow}
        colorGf={vehicle.color_gf}
        textGf={vehicle.text_gf}
        colorFlow={vehicle.color_flow}
        colorWavecolor={vehicle.color_wavecolor}
        textAmps={vehicle.text_amps}
        colorAmps={vehicle.color_amps}
        colorDvl={vehicle.color_dvl}
        textGpsAgo={vehicle.text_gpsago}
        textCellAgo={vehicle.text_cellago}
        textNoteTime={vehicle.text_notetime}
        textArrow={vehicle.text_arrow}
        colorBat1={vehicle.color_bat1}
        colorBat2={vehicle.color_bat2}
        colorBat3={vehicle.color_bat3}
        colorBat4={vehicle.color_bat4}
        colorBat5={vehicle.color_bat5}
        colorBat6={vehicle.color_bat6}
        colorBat7={vehicle.color_bat7}
        colorBat8={vehicle.color_bat8}
        colorCart={vehicle.color_cart}
        colorCartCircle={vehicle.color_cartcircle}
        colorThrust={vehicle.color_thrust}
        textSat={vehicle.text_sat}
        textLogTime={vehicle.text_logtime}
        textMission={vehicle.text_mission ?? ''}
        textReckonDistance={vehicle.text_reckondistance}
        textCriticalTime={vehicle.text_criticaltime}
        textGfTime={vehicle.text_gftime}
        textThrustTime={vehicle.text_thrusttime}
        textLogAgo={vehicle.text_logago}
        colorBigCable={vehicle.color_bigcable}
        textScheduled={vehicle.text_scheduled}
        textLastUpdate={vehicle.text_lastupdate}
        colorMissionDefault={vehicle.color_missiondefault}
        textVolts={vehicle.text_volts}
        colorVolts={vehicle.color_volts}
        status={lastDeployment.data?.recoverEvent ? 'pluggedIn' : 'onMission'}
      />
    </div>
  ) : null
}

export default VehicleDiagram
