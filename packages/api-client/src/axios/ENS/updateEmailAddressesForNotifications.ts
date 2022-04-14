// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface UpdateEmailAddressesForNotificationsParams {
  email: string
  extraEmail: string
  newExtraEmail: string
}

export interface UpdateEmailAddressesForNotificationsResponse {
  result: string
}

export const updateEmailAddressesForNotifications = async (
  params: UpdateEmailAddressesForNotificationsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens/email'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as UpdateEmailAddressesForNotificationsResponse
}
