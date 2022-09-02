// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface MissionListParams {
  reload?: 'y' | 'n'
  gitRef?: string
}

export interface MissionListItem {
  path: string
  description?: string
}

export interface MissionListResponse {
  gitRef: string
  list: MissionListItem[]
}

export const getMissionList = async (
  params: MissionListParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/git/missionList'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data?.result as MissionListResponse
}
