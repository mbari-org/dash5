import { useMutation } from 'react-query'
import { CreateUserParams, createUser, RequestConfig } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useCreateUser = (config?: RequestConfig) => {
  const { axiosInstance } = useTethysApiContext()
  const mutation = useMutation((params: CreateUserParams) => {
    return createUser(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
    })
  })
  return mutation
}
