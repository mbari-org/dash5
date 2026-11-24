import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface QueuedSbdSendEvent {
  refEventId: number
  via?: {
    medium: 'cell' | 'sat' | 'cellsat'
    timeout?: number
    fragmentForNote?: string
  }
  queuedTimeMillis?: number
  dispatched?: boolean
  servedTimeMillis?: number
}

export interface GetCommandQueueParams {
  /** Comma-separated vehicle names. Omit for all vehicles. */
  vehicles?: string
}

/** result is a map from vehicle name to its queued commands */
export type GetCommandQueueResponse = Record<string, QueuedSbdSendEvent[]>

export const getCommandQueue = async (
  params: GetCommandQueueParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/queue'

  if (debug) {
    console.debug(`GET ${url}`, params)
  }

  const response = await instance.get(url, { ...config, params })
  return response.data.result as GetCommandQueueResponse
}
