import { useCommands } from './useCommands'
import { useQuery } from 'react-query'
import { getUniversals, GetUniversalsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useUniversals = (
  params: GetUniversalsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['command', 'commands', 'universals'],
    () => {
      return getUniversals(params, { instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )

  return { ...query }
}
