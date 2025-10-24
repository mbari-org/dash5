import { useQuery } from 'react-query'
import {
  getEmailNotificationSettings,
  GetEmailNotificationSettingsParams,
} from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'
import { SupportedQueryOptions } from '../types'

export const useEmailSettings = (
  params: GetEmailNotificationSettingsParams,
  options?: SupportedQueryOptions
) => {
  const { axiosInstance, token } = useTethysApiContext()
  const query = useQuery(
    ['email', 'settings', params?.email],
    async () => {
      return await getEmailNotificationSettings(params, {
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
