// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetMissionsParams {
  subDir?: string
  tag?: string
}

export interface GetMissionsResponse {
  tag: string
  filenames: string[]
}

export const getMissions = async (
  params: GetMissionsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/git/missions'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetMissionsResponse
}
