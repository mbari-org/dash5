// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetVehiclesParams {}

export interface GetVehiclesInfo {
  vehicleName: string
  color: string
}

export type GetVehiclesResponse = GetVehiclesInfo[]

export const getVehicles = async (
  params: GetVehiclesParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/info/vehicles'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data.result as GetVehiclesResponse
}
