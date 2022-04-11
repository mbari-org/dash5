import { useMutation } from 'react-query'
import { CreateUserParams, createUser } from '../../axios'

export const useCreateUser = () => {
  const mutation = useMutation((params: CreateUserParams) => {
    return createUser(params)
  })
  return mutation
}
