// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteSimFutureEventsParams {}

export interface DeleteSimFutureEventsResponse {
  result: string
}

export const deleteSimFutureEvents = async (
  _params: DeleteSimFutureEventsParams = {},
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/events/future'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(url, config)
  return response.data as DeleteSimFutureEventsResponse
}
