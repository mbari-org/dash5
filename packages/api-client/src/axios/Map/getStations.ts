// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetStationsResponse {
  name: string
  geojson: GeoJSON
  geometry: Geometry
}

export interface GeoJSON {
  type: string
  properties: GeoProperties
}

export interface GeoProperties {
  weight: number
  color: string
}

export interface Geometry {
  type: string
  coordinates: [number, number]
}

export const getStations = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/map/layers/stations'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data as GetStationsResponse[]
}
