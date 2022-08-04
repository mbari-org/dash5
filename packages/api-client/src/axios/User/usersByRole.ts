// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface ByRoleParams {
  role: 'operator' | 'admin' | 'none'
}

export interface ByRoleResponse {
  email: string
  fullName: string
}

export const usersByRole = async (
  params: ByRoleParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/user/byrole'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(`${url}`, { ...config, params })
  return response.data.result as ByRoleResponse[]
}
