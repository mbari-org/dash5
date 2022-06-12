// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVehicleInfoParams {
  name: string
  ts?: string
}

export interface GetVehicleInfoResponse {
  text_ampago: string
  text_vehicle: string
  text_cell: string
  color_cell: string
  color_dirtbox: string
  text_leak: string
  text_speed: string
  text_dvlstatus: string
  text_stationdist: string
  color_commago: string
  text_commago: string
  text_leakago: string
  text_nextcomm: string
  text_criticalerror: string
  text_timeout: string
  color_satcomm: string
  color_smallcable: string
  text_note: string
  text_arrivestation: string
  color_missionago: string
  text_gps: string
  color_gps: string
  color_sw: string
  text_flowago: string
  text_currentdist: string
  text_droptime: string
  color_drop: string
  color_scheduled: string
  color_hw: string
  color_arrow: string
  text_bearing: string
  color_gf: string
  color_ubat: string
  color_bt2: string
  color_bt1: string
  text_gf: string
  color_flow: string
  color_wavecolor: string
  text_amps: string
  color_amps: string
  color_dvl: string
  text_gpsago: string
  text_cellago: string
  text_notetime: string
  color_bat1: string
  text_arrow: string
  color_bat3: string
  color_bat2: string
  color_bat5: string
  color_bat4: string
  color_bat7: string
  color_bat6: string
  color_cart: string
  color_bat8: string
  color_thrust: string
  text_sat: string
  text_logtime: string
  text_mission: string
  color_leak: string
  text_reckondistance: string
  text_criticaltime: string
  text_gftime: string
  text_thrusttime: string
  text_logago: string
  color_bigcable: string
  color_cartcircle: string
  text_scheduled: string
  text_lastupdate: string
  color_missiondefault: string
  text_volts: string
  color_volts: string
}

export const getVehicleInfo = async (
  { name, ...params }: GetVehicleInfoParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/widget/auv_${name}.json`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({
      ts: params.ts ?? new Date().toISOString(),
    })}`,
    config
  )
  return response.data as GetVehicleInfoResponse
}
