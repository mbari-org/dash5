import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface SessionInfo {
  tduiv: string | null
  openedMs: number | null
  session: string
}

export interface SubscriberInfo {
  sessions: SessionInfo[]
}

// Map of email → session info for all currently connected users.
export type GetSubscribersResponse = Record<string, SubscriberInfo>

// GET /api/async/subscribers — requires operator or admin role.
// Authorization is handled by the shared axiosInstance (Bearer token injected
// at the axios layer), so no token parameter is needed here.
export const getSubscribers = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/async/subscribers'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data.result as GetSubscribersResponse
}
