import { useMutation } from 'react-query'
import { CreateLoginParams, createLogin } from '../../axios'
import { AxiosInstance } from 'axios'
import useSessionToken from './useSessionToken'

export const useCreateLogin = (config?: {
  instance: AxiosInstance
  sessionTokenIdentifier?: string
}) => {
  const { setSessionToken } = useSessionToken(
    config?.sessionTokenIdentifier ?? 'TETHYS_ACCESS_TOKEN'
  )
  const mutation = useMutation(
    (params: CreateLoginParams) => {
      return createLogin(params, config)
    },
    {
      onSettled: data => {
        setSessionToken(data?.token ?? '')
      },
    }
  )
  return mutation
}
