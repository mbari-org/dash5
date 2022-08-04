import { useQuery } from 'react-query'
import { getUnits } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useUnits = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['commands', 'units'],
    () => {
      return getUnits({ instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
