// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVConfigParams {
  vehicle: string
  gitTag: string
  since: string
}

export interface GetVConfigResponse {
  result: string
}

export const getVConfig = async (
  params: GetVConfigParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/vconfig'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetVConfigResponse
}
