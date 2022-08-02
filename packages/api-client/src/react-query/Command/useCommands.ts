import { useQuery } from 'react-query'
import { getCommands } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useCommands = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['command', 'commands'],
    () => {
      return getCommands({ instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
