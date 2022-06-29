// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVPosParams {
  [key: string]: string | number | undefined
  vehicle: string
  to?: string
  from: string
  limit?: number
}

export interface VPosDetail {
  eventId: string
  unixTime: number
  isoTime: string
  latitude: number
  longitude: number
  component: string
  note: string
  text: string
}

export interface GetVPosResponse {
  inputs: GetVPosParams
  gpsFixes: VPosDetail[]
  argoReceives: VPosDetail[]
  emergencies: VPosDetail[]
  reachedWaypoints: VPosDetail[]
}

export const getVPos = async (
  params: GetVPosParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/vpos'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({
      ...Object.keys(params).reduce(
        (a, b) => (params[b] ? { ...a, [b]: params[b] } : a),
        {}
      ),
      limit: params.limit?.toString() ?? '1000',
    })}`,
    config
  )
  return response.data.result as GetVPosResponse
}
