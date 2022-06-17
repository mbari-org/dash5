// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetEmailNotificationsParams {
  allUsers: string
}

export interface GetEmailNotificationsResponse {
  result: string
}

export const getEmailNotifications = async (
  params: GetEmailNotificationsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens/emails'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetEmailNotificationsResponse
}
