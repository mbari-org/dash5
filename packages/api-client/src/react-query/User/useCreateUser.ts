import { useMutation } from 'react-query'
import { CreateUserParams, createUser, RequestConfig } from '../../axios'

export const useCreateUser = (config: RequestConfig) => {
  const mutation = useMutation((params: CreateUserParams) => {
    return createUser(params, config)
  })
  return mutation
}
