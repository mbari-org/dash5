import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface AddExtraEmailToUserParams {
  email: string
  addExtraEmails: string
}

export interface AddExtraEmailToUserResponse {
  result: {
    email: string
    firstName?: string
    lastName?: string
    extraEmails?: string[]
    roles?: string[]
  }
}

export const addExtraEmailToUser = async (
  params: AddExtraEmailToUserParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as AddExtraEmailToUserResponse
}
