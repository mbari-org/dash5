// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetFrequentCommandsParams {
  vehicleName: string
}

export interface GetFrequentCommandsResponse {
  result: string
}

export const getFrequentCommands = async (
  params: GetFrequentCommandsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/frequent'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetFrequentCommandsResponse
}
