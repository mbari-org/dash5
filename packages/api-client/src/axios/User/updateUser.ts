// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface UpdateUserParams {
  email: string
  firstName: string
  lastName: string
  roles?: string
  requestedRoles?: string
  addExtraEmails?: string
}

export interface UpdateUserResponse {
  token: string
}

export const updateUser = async (
  params: UpdateUserParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/user'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params)
  return response.data as UpdateUserResponse
}
