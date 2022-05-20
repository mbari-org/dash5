// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVehicleNamesParams {
  refresh: 'y' | 'n'
}

export type GetVehicleNamesResponse = string[]

export const getVehicleNames = async (
  params: GetVehicleNamesParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/info/vehicleNames'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data.result as GetVehicleNamesResponse
}
