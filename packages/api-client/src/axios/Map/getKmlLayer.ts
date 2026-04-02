import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetKmlLayerParams {
  path: string
}

export const getKmlLayer = async (
  params: GetKmlLayerParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/info/map/kmlLayer'

  if (debug) {
    console.debug(`GET ${url}?path=${params.path}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  // Returns raw KML/KMZ content as a string
  return response.data as string
}
