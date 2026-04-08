import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface KmlLayerListItem {
  name: string
  path: string
  options?: {
    opacity?: number
    [key: string]: unknown
  }
}

export interface GetKmlLayersApiResponse {
  result: KmlLayerListItem[]
}

export const getKmlLayers = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/info/map/kmlLayers'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return (response.data as GetKmlLayersApiResponse).result
}
