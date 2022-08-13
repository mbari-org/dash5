import { useQuery } from 'react-query'
import { getStations } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useStations = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()

  const query = useQuery(
    ['map', 'stations'],
    () => {
      return getStations({ instance: axiosInstance })
    },
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  )

  return query
}
