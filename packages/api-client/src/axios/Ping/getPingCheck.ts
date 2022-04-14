// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetPingCheckParams {
  vehicleName: string
}

export interface GetPingCheckResponse {
  result: string
}

export const getPingCheck = async (
  params: GetPingCheckParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ping/check'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetPingCheckResponse
}
