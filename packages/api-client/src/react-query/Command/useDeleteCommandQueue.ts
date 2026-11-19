import { useMutation, useQueryClient } from 'react-query'
import {
  DeleteCommandQueueParams,
  deleteCommandQueue,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { COMMAND_QUEUE_QUERY_KEY } from './useCommandQueue'

export const useDeleteCommandQueue = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (params: DeleteCommandQueueParams) => {
      return deleteCommandQueue(params, {
        ...(config ?? {}),
        instance: config?.instance ?? axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['event', 'events'])
        queryClient.invalidateQueries([
          'deployment',
          'deployments',
          'commandStatus',
        ])
        queryClient.invalidateQueries(COMMAND_QUEUE_QUERY_KEY)
      },
    }
  )
  return mutation
}
