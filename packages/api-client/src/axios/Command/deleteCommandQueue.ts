import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteCommandQueueParams {
  vehicle: string
  refEventId: number
}

export interface DeleteCommandQueueResponse {
  result: string
}

export const deleteCommandQueue = async (
  params: DeleteCommandQueueParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/queue'

  if (debug) {
    console.debug(`DELETE ${url}`, params)
  }

  const response = await instance.delete(url, {
    ...config,
    params,
  })
  return response.data as DeleteCommandQueueResponse
}
