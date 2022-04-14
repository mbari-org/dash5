// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteEmailAddressesForNotificationsParams {
  email: string
  extraEmail: string
}

export interface DeleteEmailAddressesForNotificationsResponse {
  result: string
}

export const deleteEmailAddressesForNotifications = async (
  params: DeleteEmailAddressesForNotificationsParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/ens/email'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(
    `${url}?${new URLSearchParams({ ...params })}`
  )
  return response.data as DeleteEmailAddressesForNotificationsResponse
}
