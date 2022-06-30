import { useMutation } from 'react-query'
import { resetPassword, ResetPasswordParams, RequestConfig } from '../../axios'
import { useAuthContext } from '../AuthProvider'

export const useResetPassword = (config?: RequestConfig) => {
  const { axiosInstance } = useAuthContext()
  const mutation = useMutation((params: ResetPasswordParams) => {
    return resetPassword(params, {
      ...(config ?? {}),
      instance: config?.instance ?? axiosInstance,
    })
  })
  return mutation
}
