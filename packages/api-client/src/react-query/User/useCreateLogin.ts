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
      onSettled: (data, error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[useCreateLogin] onSettled — token length:',
            data?.token?.length ?? 0,
            '| has error:',
            !!error
          )
          if (error) {
            const message =
              error instanceof Error ? error.message : 'login request failed'
            console.error('[useCreateLogin] login failed:', message)
          }
        }
        setSessionToken(data?.token ?? '')
      },
    }
  )
  return mutation
}
