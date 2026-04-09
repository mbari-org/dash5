import { useQuery } from 'react-query'
import { getPolygons } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const usePolygons = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()

  const query = useQuery(
    ['map', 'polygons'],
    () => {
      return getPolygons({ instance: axiosInstance })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )

  return query
}
