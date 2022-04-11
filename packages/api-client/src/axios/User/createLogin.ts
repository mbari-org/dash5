import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CreateLoginParams {
  email: string
  password: string
}

export const createLogin = async (
  params: CreateLoginParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const method = 'POST'
  const url = '/user/auth'

  if (debug) {
    console.debug(`${method} ${url}`)
  }

  return instance({ method, url, data: params })
}
