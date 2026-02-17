import { useMutation, useQueryClient } from 'react-query'
import {
  deleteEmailNotificationSettings,
  DeleteEmailNotificationSettingsParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useDeleteEmailSettings = () => {
  const queryClient = useQueryClient()
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: DeleteEmailNotificationSettingsParams) => {
      return deleteEmailNotificationSettings(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: (_data, variables) => {
        if (variables?.email) {
          queryClient.invalidateQueries(['email', 'settings', variables.email])
        }
      },
    }
  )
  return mutation
}
