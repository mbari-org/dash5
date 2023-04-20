import { useMutation, useQueryClient } from 'react-query'
import { CreateCommandParams, createCommand, RequestConfig } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useCreateCommand = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (params: CreateCommandParams) => {
      return createCommand(params, {
        ...(config ?? {}),
        instance: config?.instance ?? axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['event', 'events'])
      },
    }
  )
  return mutation
}
