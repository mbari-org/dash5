import { useMutation } from 'react-query'
import { CreateCommandParams, createCommand, RequestConfig } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useCreateCommand = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: CreateCommandParams) => {
    return createCommand(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
