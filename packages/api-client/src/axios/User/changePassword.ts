// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface ChangePasswordParams {
  email: string
  password: string
}

export interface ChangePasswordResponse {
  token: string
}

export const changePassword = async (
  params: ChangePasswordParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as ChangePasswordResponse
}
