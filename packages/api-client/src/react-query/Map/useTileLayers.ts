import { useQuery } from 'react-query'
import { getTileLayers } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useTileLayers = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()

  return useQuery(
    ['map', 'tileLayers'],
    () => getTileLayers({ instance: axiosInstance }),
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )
}
