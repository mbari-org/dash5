import { useCommands } from './useCommands'
import { useQuery } from 'react-query'
import { getRecentCommands, GetRecentCommandsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useRecentCommands = (
  params: GetRecentCommandsParams,
  options?: SupportedQueryOptions
) => {
  const commands = useCommands(options)
  const { axiosInstance } = useTethysApiContext()
  const query = useQuery(
    ['command', 'commands', 'recent'],
    () => {
      return getRecentCommands(params, { instance: axiosInstance })
    },
    {
      staleTime: 60 * 1000,
      ...options,
    }
  )

  const data = query.data
    ?.map((commandEvent) => {
      const keyword = commandEvent.text?.replace('%20', ' ').split(' ')[0]
      const command = commands.data?.commands.find((c) => c.keyword === keyword)
      if (command) {
        return { writtenCommand: commandEvent.text, command }
      }
      return undefined
    })
    .filter((c) => c)

  return { ...query, isLoading: commands.isLoading || query.isLoading, data }
}
