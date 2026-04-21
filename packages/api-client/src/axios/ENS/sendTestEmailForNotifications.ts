// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface SendTestEmailForNotificationsParams {
  email: string
  plainText: 'y' | 'n'
}

export interface SendTestEmailForNotificationsResponse {
  email_sent: string
}

export const sendTestEmailForNotifications = async (
  params: SendTestEmailForNotificationsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens/test'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, null, { ...config, params })
  return response.data as SendTestEmailForNotificationsResponse
}
