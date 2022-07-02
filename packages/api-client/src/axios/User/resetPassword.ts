// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface ResetPasswordParams {
  email: string
}

export interface ResetPasswordResponse {
  message: string
}

export const resetPassword = async (
  params: ResetPasswordParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user/rpw'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data.result as ResetPasswordResponse
}
