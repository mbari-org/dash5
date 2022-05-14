import { useMutation } from 'react-query'
import { CreateLoginParams, createLogin } from '../../axios'
import { AxiosInstance } from 'axios'

export const useCreateLogin = (config?: { instance: AxiosInstance }) => {
  const mutation = useMutation((params: CreateLoginParams) => {
    return createLogin(params, config)
  })
  return mutation
}
