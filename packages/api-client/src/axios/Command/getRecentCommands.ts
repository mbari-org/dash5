// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetRecentCommandsParams {
  vehicleName: string
}

export interface GetRecentCommandsResponse {
  result: string
}

export const getRecentCommands = async (
  params: GetRecentCommandsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/recent'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetRecentCommandsResponse
}
