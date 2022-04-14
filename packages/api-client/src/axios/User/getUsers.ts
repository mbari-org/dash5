// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface GetUsersParams {}

export interface GetUsersResponse {
  users: User[]
}

export const getUsers = async (
  params: GetUsersParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/user'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, params)
  return response.data as GetUsersResponse
}
