import { useQuery } from 'react-query'
import { getEmailNotifications, GetEmailNotificationsParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useEmailAddresses = (
  params?: GetEmailNotificationsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['email', 'addresses', params?.allUsers],
    async () => {
      return await getEmailNotifications(params ?? {}, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      enabled: (options?.enabled ?? true) && (token?.length ?? 0) > 0,
      ...options,
    }
  )
  return query
}
