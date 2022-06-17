// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteEmailNotificationSettingsParams {
  email: string
}

export interface DeleteEmailNotificationSettingsResponse {
  result: string
}

export const deleteEmailNotificationSettings = async (
  params: DeleteEmailNotificationSettingsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as DeleteEmailNotificationSettingsResponse
}
