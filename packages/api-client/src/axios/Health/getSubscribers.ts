import { AxiosInstance } from 'axios'
import { getInstance } from '../getInstance'

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
export const getSubscribers = async (
  token?: string,
  instance?: AxiosInstance
) => {
  const axios = instance ?? getInstance()
  const response = await axios.get('async/subscribers', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  return response.data.result as GetSubscribersResponse
}
