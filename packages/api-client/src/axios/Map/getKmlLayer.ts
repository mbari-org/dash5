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

  const data = response.data

  // The endpoint may return the raw KML string directly, or it may wrap it
  // in a JSON envelope { result: '<kml...>' } depending on the server version.
  if (typeof data === 'string') {
    return data
  }

  if (
    data &&
    typeof data === 'object' &&
    'result' in data &&
    typeof (data as Record<string, unknown>).result === 'string'
  ) {
    return (data as { result: string }).result
  }

  throw new Error(
    `Unexpected response format from ${url}: expected a KML string or { result: string }`
  )
}
