import { useMutation } from 'react-query'
import { sendVerificationCode, SendVerificationCodeParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useSendVerificationCode = () => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation((params: SendVerificationCodeParams) => {
    return sendVerificationCode(params, {
      instance: axiosInstance,
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  return mutation
}
