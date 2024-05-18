// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetPlatformsParams {
  refresh: 'y' | 'n'
}

export interface GetPlatformsResponse {
  _id: string
  name: string
  abbreviation: string
  typeName: string
  color: string
  iconUrl: string | null
}

export const getPlatforms = async (
  params: GetPlatformsParams,
  {
    debug,
    instance = getInstance(),
    baseURL = '',
    ...config
  }: RequestConfig = {}
) => {
  const url = `${baseURL}/trackdb/platforms`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data as GetPlatformsResponse[]
}
