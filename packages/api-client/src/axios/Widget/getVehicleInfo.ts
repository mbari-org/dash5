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
  color_argo?: string
  color_ot?: string
  color_ctd?: string
  color_camerabody?: string
  color_cameralens?: string
  color_cam1?: string
  color_cam2?: string
  color_voltthresh?: string
  color_ampthresh?: string
  color_duration?: string
  text_voltthresh?: string
  text_ampthresh?: string
  text_batteryduration?: number | string
  text_batteryunits?: string
  text_current?: number | string
  text_needcomms?: string
  text_missionago?: string
  text_cameraago?: string
  text_version?: string
  svg_current?: string
  color_lowgf?: string
  color_highgf?: string
  color_missiontext?: string
  color_logago?: string
  color_satcommstext?: string
  color_nextcommstext?: string
  color_timeouttext?: string
  dock_buoy?: string
  dock_eye?: string
  dock_line?: string
  dock_tri?: string
  text_LM?: string
  text_HM?: string
  text_roiago?: string
  text_waypoint?: string
  color_whitebeam?: string
  color_whiteled?: string
  color_redbeam?: string
  color_redled?: string
  not_found: boolean
}

export const getVehicleInfo = async (
  { name, ...params }: GetVehicleInfoParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/widget/auv_${name}.json`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  try {
    const response = await instance.get(
      `${url}?${new URLSearchParams({
        ts: params.ts ?? new Date().toISOString(),
      })}`,
      config
    )
    return response.data as GetVehicleInfoResponse
  } catch (e: unknown) {
    if ((e as Error).message.indexOf('404')) {
      return { not_found: true }
    } else {
      throw e
    }
  }
}
