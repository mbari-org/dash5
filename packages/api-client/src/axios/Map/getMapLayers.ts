// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetMapLayersParams {
  layers: string
}

export interface GetMapLayersResponse {
  result: string
}

export const getMapLayers = async (
  params: GetMapLayersParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/info/map/'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as GetMapLayersResponse
}
