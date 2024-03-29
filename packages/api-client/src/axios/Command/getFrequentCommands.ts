// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetFrequentCommandsParams {
  vehicle: string
  limit?: number
}

export type GetFrequentCommandsResponse = string[]

export const getFrequentCommands = async (
  params: GetFrequentCommandsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/frequent'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetFrequentCommandsResponse
}
