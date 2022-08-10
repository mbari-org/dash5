import { useCommands } from './useCommands'
import { useQuery } from 'react-query'
import { getFrequentCommands, GetFrequentCommandsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useFrequentCommands = (
  params: GetFrequentCommandsParams,
  options?: SupportedQueryOptions
) => {
  const commands = useCommands(options)
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['command', 'commands', 'frequent'],
    () => {
      return getFrequentCommands(params, { instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )

  const data = query.data
    ?.map((writtenCommand) => {
      const keyword = writtenCommand.replace('%20', ' ').split(' ')[0]
      const command = commands.data?.commands.find((c) => c.keyword === keyword)
      if (command) {
        return { writtenCommand, command }
      }
      return undefined
    })
    .filter((c) => c)

  return { ...query, isLoading: commands.isLoading || query.isLoading, data }
}
