import { useQuery } from 'react-query'
import { getScript, GetScriptParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useScript = (
  params: GetScriptParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['commands', 'script', params],
    () => {
      return getScript(params, { instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )
  return query
}
