import { useQuery } from 'react-query'
import { getKmlLayers } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useKmlLayers = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()

  return useQuery(
    ['map', 'kmlLayers'],
    () => getKmlLayers({ instance: axiosInstance }),
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
}
