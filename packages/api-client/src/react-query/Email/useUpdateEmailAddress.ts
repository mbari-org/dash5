import { useMutation, useQueryClient } from 'react-query'
import {
  updateEmailAddressesForNotifications,
  UpdateEmailAddressesForNotificationsParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useUpdateEmailAddress = () => {
  const queryClient = useQueryClient()
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: UpdateEmailAddressesForNotificationsParams) => {
      return updateEmailAddressesForNotifications(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['email', 'addresses'])
        if (variables?.email) {
          queryClient.invalidateQueries(['email', 'settings', variables.email])
        }
        if (variables?.extraEmail) {
          queryClient.invalidateQueries([
            'email',
            'settings',
            variables.extraEmail,
          ])
        }
        if (variables?.newExtraEmail) {
          queryClient.invalidateQueries([
            'email',
            'settings',
            variables.newExtraEmail,
          ])
        }
      },
    }
  )
  return mutation
}
