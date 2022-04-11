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

export const createUser = async (
  params: CreateUserParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const method = 'POST'
  const url = '/user'

  if (debug) {
    console.debug(`${method} ${url}`)
  }

  return instance({ method, url, data: params })
}
