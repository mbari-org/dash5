// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetEmailNotificationsParams {
  allUsers?: string
}

export interface EmailOwner {
  ownerEmail: string | null
  ownerName: string
}

export interface GetEmailNotificationsResponse {
  result: Record<string, EmailOwner>
}

export const getEmailNotifications = async (
  params: GetEmailNotificationsParams = {},
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens/emails'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, {
    ...config,
    params: params.allUsers ? { allUsers: params.allUsers } : undefined,
  })
  return response.data as GetEmailNotificationsResponse
}
