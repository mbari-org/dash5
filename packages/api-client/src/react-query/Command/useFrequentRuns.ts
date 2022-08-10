import { useQuery } from 'react-query'
import { getFrequentRuns, GetFrequentRunsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useFrequentRuns = (
  params: GetFrequentRunsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['command', 'commands', 'frequent', 'runs'],
    () => {
      return getFrequentRuns(params, { instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )

  const data = query.data
    ?.map((writtenCommand) => {
      const mission = writtenCommand
        .replace('%20', ' ')
        .replace(';', ' ')
        .split(' ')[1]
      if (mission) {
        return { writtenCommand, mission }
      }
      return undefined
    })
    .filter((c) => c)

  return { ...query, isLoading: query.isLoading, data }
}
