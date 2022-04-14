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
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/ens'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as GetEmailNotificationSettingsResponse
}
