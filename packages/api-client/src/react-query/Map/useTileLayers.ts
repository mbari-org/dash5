import { useQuery } from 'react-query'
import { getTileLayers } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

// Layers temporarily disabled while the geoserver is compromised.
// Re-enable by removing names from this set once the server is restored.
const DISABLED_TILE_LAYER_NAMES = new Set(['DK3HORRO', '2020 Summer Astrid'])

export const useTileLayers = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()

  return useQuery(
    ['map', 'tileLayers'],
    () => getTileLayers({ instance: axiosInstance }),
    {
      staleTime: 5 * 60 * 1000,
      ...options,
      select: (data) =>
        data.filter((layer) => !DISABLED_TILE_LAYER_NAMES.has(layer.name)),
    }
  )
}
