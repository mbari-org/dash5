import { useQuery } from 'react-query'
import { getHealth } from '../../axios/Health/getHealth'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useHealth = (options?: SupportedQueryOptions) => {
  const { axiosInstance } = useTethysApiContext()
  return useQuery(
    ['health'],
    () => getHealth({ instance: axiosInstance ?? undefined }),
    {
      refetchInterval: 30 * 1000,
      staleTime: 25 * 1000,
      ...options,
    }
  )
}
