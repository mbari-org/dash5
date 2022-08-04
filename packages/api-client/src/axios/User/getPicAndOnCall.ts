// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetPicUser {
  user: string
  email: string
  unixTime: number
  requestBy?: string
}

export interface GetPicAndOnCallParams {
  vehicleName: string
  from?: string
  to?: string
}

export interface GetPicAndOnCallResponse {
  vehicleName: string
  unixTime: number
  pic?: GetPicUser
  onCall?: GetPicUser
}

export const getPicAndOnCall = async (
  params: GetPicAndOnCallParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user/picoc'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetPicAndOnCallResponse
}
