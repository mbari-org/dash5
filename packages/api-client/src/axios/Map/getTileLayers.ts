import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface TileLayerOptions {
  format?: string
  layers?: string
  opacity?: number
  request?: string
  service?: string
  srs?: string
  styles?: string
  transparent?: string
  version?: string
  bgcolor?: string
  exceptions?: string
  elevation?: string
  singleTile?: string
  map?: string
  attribution?: string
  maxZoom?: number
  tileSize?: number
  tms?: boolean
  [key: string]: unknown
}

export interface GetTileLayersResponse {
  name: string
  urlTemplate: string
  wms?: boolean
  legendurl?: string
  type?: string
  options?: TileLayerOptions
}

export interface GetTileLayersApiResponse {
  result: GetTileLayersResponse[]
}

export const getTileLayers = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/info/map/tileLayers'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return (response.data as GetTileLayersApiResponse).result
}
