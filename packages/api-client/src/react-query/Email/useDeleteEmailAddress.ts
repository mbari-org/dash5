import { useMutation, useQueryClient } from 'react-query'
import {
  deleteEmailAddressesForNotifications,
  DeleteEmailAddressesForNotificationsParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useDeleteEmailAddress = () => {
  const queryClient = useQueryClient()
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: DeleteEmailAddressesForNotificationsParams) => {
      return deleteEmailAddressesForNotifications(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['email', 'addresses'])
        if (variables?.extraEmail) {
          queryClient.invalidateQueries([
            'email',
            'settings',
            variables.extraEmail,
          ])
        }
      },
    }
  )
  return mutation
}
