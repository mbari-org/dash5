import { useMutation } from 'react-query'
import {
  sendTestEmailForNotifications,
  SendTestEmailForNotificationsParams,
  RequestConfig,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useSendTestEmail = (config?: RequestConfig) => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: SendTestEmailForNotificationsParams) => {
      return sendTestEmailForNotifications(params, {
        ...(config ?? {}),
        instance: config?.instance ?? axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    }
  )
  return mutation
}
