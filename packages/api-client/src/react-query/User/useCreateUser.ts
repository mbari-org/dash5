import { useMutation } from 'react-query'
import { CreateUserParams, createUser } from '../../axios/User/createUser'

export const useCreateUser = () => {
  const mutation = useMutation((params: CreateUserParams) => {
    return createUser(params)
  })
  return mutation
}
