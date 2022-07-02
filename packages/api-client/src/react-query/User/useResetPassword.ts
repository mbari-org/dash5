import { useMutation } from 'react-query'
import { resetPassword, ResetPasswordParams, RequestConfig } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useResetPassword = (config?: RequestConfig) => {
  const { axiosInstance } = useTethysApiContext()
  const mutation = useMutation((params: ResetPasswordParams) => {
    return resetPassword(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
    })
  })
  return mutation
}
