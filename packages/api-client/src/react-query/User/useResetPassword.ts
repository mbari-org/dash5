import { useMutation } from 'react-query'
import { resetPassword, ResetPasswordParams } from '../../axios'
import { AxiosInstance } from 'axios'
import { useAuthContext } from '../AuthProvider'

export const useResetPassword = (config?: { instance: AxiosInstance }) => {
  const { axiosInstance } = useAuthContext()
  const mutation = useMutation((params: ResetPasswordParams) => {
    return resetPassword(params, {
      instance: config?.instance ?? axiosInstance,
    })
  })
  return mutation
}
