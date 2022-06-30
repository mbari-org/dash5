import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CreateUserParams {
  email: string
  firstName: string
  lastName: string
  password: string
  recaptchaResponse: string
  requestedRoles: string
}

export interface CreateUserResponse {
  email: string
  firstName: string
  lastName: string
  requestedRoles: string[]
}

export const createUser = async (
  params: CreateUserParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, { data: params }, config)
  return response.data.result as CreateUserResponse
}
