import { useMutation } from 'react-query'
import { CreateLoginParams, createLogin } from '../../axios'

export const useCreateLogin = () => {
  const mutation = useMutation((params: CreateLoginParams) => {
    return createLogin(params)
  })
  return mutation
}
