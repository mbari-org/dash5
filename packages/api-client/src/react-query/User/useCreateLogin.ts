import { useMutation } from 'react-query'
import { CreateLoginParams, createLogin } from '../../axios'
import { AxiosInstance } from 'axios'

export const useCreateLogin = (config: {
  instance: AxiosInstance
  setSessionToken: (token: string) => void
  sessionToken: string
}) => {
  const { setSessionToken, instance } = config
  const mutation = useMutation(
    (params: CreateLoginParams) => {
      return createLogin(params, { instance })
    },
    {
      onSuccess: (data) => {
        setSessionToken(data?.token ?? '')
      },
    }
  )
  return mutation
}
