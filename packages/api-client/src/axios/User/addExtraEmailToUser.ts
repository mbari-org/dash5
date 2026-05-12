import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

/**
 * Adds an extra notification email address to a user account via PUT /user.
 *
 * This is intentionally separate from `updateUser` because the two calls
 * target different use-cases and return different response shapes:
 *   - `updateUser`          → updates profile fields, returns `{ token }`
 *   - `addExtraEmailToUser` → manages extra email addresses, returns the
 *                             full user object including `extraEmails[]`
 *
 * Merging them would require a union return type and make call-sites harder
 * to type-check correctly.
 */
export interface AddExtraEmailToUserParams {
  email: string
  addExtraEmails: string
}

export interface AddExtraEmailToUserResponse {
  result: {
    email: string
    firstName?: string
    lastName?: string
    extraEmails?: string[]
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
