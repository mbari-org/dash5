import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CreateLoginParams {
  email: string
  password: string
}

export interface CreateLoginResponse {
  token: string
}

export const createLogin = async (
  params: CreateLoginParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user/auth'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as CreateLoginResponse
}
