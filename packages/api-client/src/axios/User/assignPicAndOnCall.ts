// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface AssignPicAndOnCallParams {
  vehicleName: string
  email?: string
  sign: 'in' | 'off'
  subRole: 'pic' | 'onCall'
}

export interface AssignPicAndOnCallResponse {
  eventId: number
  vehicleName: string
  unixTime: number
  eventType: string
  note: string
  user: string
  state: number
  isoTime: string
}

export const assignPicAndOnCall = async (
  params: AssignPicAndOnCallParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user/picoc'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, undefined, { ...config, params })
  return response.data.result as AssignPicAndOnCallResponse
}
