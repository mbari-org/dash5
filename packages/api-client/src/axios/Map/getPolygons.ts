import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface PolygonFeature {
  type: string
  properties: Record<string, unknown>
  geometry: {
    type: string
    coordinates: unknown
  }
}

export interface PolygonGeoJSON {
  type: string
  name: string
  properties: {
    color?: string
  }
  features: PolygonFeature[]
}

export interface GetPolygonsResponse {
  name: string
  geojson: PolygonGeoJSON
}

export const getPolygons = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/map/layers/polygons'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data as GetPolygonsResponse[]
}
