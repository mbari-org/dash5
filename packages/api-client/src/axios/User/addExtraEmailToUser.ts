import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

/**
 * Adds an extra notification recipient via PUT /user.
 *
 * TethysDash 4.99.102: send `addExtraEmail` (singular). The former
 * `addExtraEmails` field is deprecated and must not be sent together
 * with `addExtraEmail` (that combination returns 400). `code` is
 * required when adding a recipient.
 */
export interface AddExtraEmailToUserParams {
  email: string
  addExtraEmail: string
  code: string
}

export interface AddExtraEmailToUserResponse {
  result: {
    email: string
    firstName?: string
    lastName?: string
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
