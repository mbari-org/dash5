import { useQuery } from 'react-query'
import { getModuleInfo } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useModuleInfo = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['commands', 'moduleInfo'],
    () => {
      return getModuleInfo({ instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
