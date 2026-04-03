import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { getMapKmlLayer } from './getMapKmlLayer'

export interface GetKmlLayerParams {
  path: string
}

// Thin wrapper over getMapKmlLayer that normalises the response to a plain
// string.  The /info/map/kmlLayer endpoint may return either a JSON envelope
// { result: '<kml...>' } (handled by getMapKmlLayer) or a raw XML string
// depending on the server version.
export const getKmlLayer = async (
  params: GetKmlLayerParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const data = await getMapKmlLayer(params, { debug, instance, ...config })

  // getMapKmlLayer types the response as { result: string }, but older server
  // versions may return the raw KML string directly.
  if (typeof data === 'string') {
    return data as string
  }

  if (
    data &&
    typeof data === 'object' &&
    'result' in data &&
    typeof (data as { result: unknown }).result === 'string'
  ) {
    return (data as { result: string }).result
  }

  throw new Error(
    'Unexpected response format from /info/map/kmlLayer: expected a KML string or { result: string }'
  )
}
