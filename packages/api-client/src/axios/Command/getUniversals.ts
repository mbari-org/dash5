// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetUniversalsParams {}

export type GetUniversalsResponse = string[]

export const getUniversals = async (
  params: GetUniversalsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/universals'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetUniversalsResponse
}
