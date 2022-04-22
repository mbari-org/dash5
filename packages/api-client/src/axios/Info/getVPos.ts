// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVPosParams {
  vehicle: string
  to: string
  from: string
  limit: number
}

export interface GetVPosResponse {
  inputs: GetVPosParams
  gpsFixes: object[]
  argoReceives: object[]
  emergencies: object[]
  reachedWaypoints: object[]
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
      ...params,
      limit: params.limit.toString(),
    })}`,
    config
  )
  return response.data as GetVPosResponse
}
