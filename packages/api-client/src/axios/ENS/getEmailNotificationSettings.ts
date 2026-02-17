// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export type FilteringType = 'LITERAL' | 'GLOB' | 'REGEX'

export interface EmailNotificationLine {
  eventKind: string
  textFilter: string | null
  filteringType: FilteringType
  vehiclesChecked: string[]
}

export interface EmailSettingsDetails {
  vehiclesEnabled: string[]
  notifLines: EmailNotificationLine[]
}

export interface GetEmailNotificationSettingsParams {
  email: string
}

export interface GetEmailNotificationSettingsResponse {
  email?: string
  details?: EmailSettingsDetails
  plainText?: 'y' | 'n' | boolean
}

export const getEmailNotificationSettings = async (
  params: GetEmailNotificationSettingsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/ens'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return (response.data?.result ??
    response.data) as GetEmailNotificationSettingsResponse
}
