// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface UpdateEmailNotificationSettingsParams {
  email: string
  plainText: string
}

export interface UpdateEmailNotificationSettingsResponse {
  result: string
}

export const updateEmailNotificationSettings = async (
  params: UpdateEmailNotificationSettingsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as UpdateEmailNotificationSettingsResponse
}
