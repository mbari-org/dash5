import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetWaypointsParams {
  vehicle: string
  to?: number
}

export interface Waypoint {
  lat: number
  lon: number
  name?: string
  unixTime?: number
}

export interface GetWaypointsResponse {
  missionStartedEvent?: {
    name: string
    unixTime: number
  }
  latestPosition?: {
    lat: number
    lon: number
    unixTime?: number
  }
  points: Waypoint[]
  vehicleName: string
}

export const getWaypoints = async (
  params: GetWaypointsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/wp'

  if (debug) {
    console.debug(`GET ${url}`, params)
  }

  const response = await instance.get(url, { ...config, params })
  const result = response.data.result

  return {
    ...result,
    vehicleName: params.vehicle,
  } as GetWaypointsResponse
}
