// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetEmailNotificationSettingsParams {
  email: string
}

export interface GetEmailNotificationSettingsResponse {
  result: string
}

export const getEmailNotificationSettings = async (
  params: GetEmailNotificationSettingsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetEmailNotificationSettingsResponse
}
