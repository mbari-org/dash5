// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetMapKmlLayerParams {
  path: string
}

export interface GetMapKmlLayerResponse {
  result: string
}

export const getMapKmlLayer = async (
  params: GetMapKmlLayerParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/info/map/kmlLayer'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetMapKmlLayerResponse
}
