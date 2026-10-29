import { useMutation, useQueryClient } from 'react-query'
import {
  DeleteCommandQueueParams,
  deleteCommandQueue,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

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
      onSuccess: (data) => {
        // Skip cache invalidation when TethysDash returns an error body on a
        // 200 (e.g. "Command already dispatched to vehicle"). The caller reads
        // data.error and may show a confirm dialog before retrying with force=true;
        // invalidating caches here would trigger spurious refetches mid-flow.
        if (data?.error) return
        queryClient.invalidateQueries(['event', 'events'])
        queryClient.invalidateQueries([
          'deployment',
          'deployments',
          'commandStatus',
        ])
      },
    }
  )
  return mutation
}
