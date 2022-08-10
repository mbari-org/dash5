// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

import { GetEventsResponse } from '../Event/getEvents'

export interface GetRecentCommandsParams {
  vehicleName: string
  limit?: number
}

export type GetRecentCommandsResponse = GetEventsResponse[]

export const getRecentCommands = async (
  params: GetRecentCommandsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/recent'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetRecentCommandsResponse
}
