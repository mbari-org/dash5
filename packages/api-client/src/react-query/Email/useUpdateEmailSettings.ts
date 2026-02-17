import { useMutation, useQueryClient } from 'react-query'
import {
  updateEmailNotificationSettings,
  UpdateEmailNotificationSettingsParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient()
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: UpdateEmailNotificationSettingsParams) => {
      return updateEmailNotificationSettings(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: (_data, variables) => {
        if (variables?.email) {
          queryClient.invalidateQueries(['email', 'settings', variables.email])
        } else {
          queryClient.invalidateQueries(['email', 'settings'])
        }
      },
    }
  )
  return mutation
}
