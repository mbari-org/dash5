import { useMutation } from 'react-query'
import { CreateUserParams, createUser, RequestConfig } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useCreateUser = (config?: RequestConfig) => {
  const { axiosInstance } = useAuthContext()
  const mutation = useMutation((params: CreateUserParams) => {
    return createUser(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
    })
  })
  return mutation
}
