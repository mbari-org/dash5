// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { EmailNotificationLine } from './getEmailNotificationSettings'

export interface UpdateEmailNotificationSettingsParams {
  email: string
  plainText: 'y' | 'n'
  details: {
    vehiclesEnabled?: string[]
    notifLines?: EmailNotificationLine[]
    [key: string]: unknown
  }
}

export interface UpdateEmailNotificationSettingsResponse {
  result: string
}

export const updateEmailNotificationSettings = async (
  { email, plainText, details }: UpdateEmailNotificationSettingsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, details, {
    ...config,
    params: { email, plainText },
  })
  return (response.data?.result ??
    response.data) as UpdateEmailNotificationSettingsResponse
}
