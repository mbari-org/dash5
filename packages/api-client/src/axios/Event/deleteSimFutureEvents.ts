// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface DeleteSimFutureEventsParams {}

export interface DeleteSimFutureEventsResponse {
  result: string
}

export const deleteSimFutureEvents = async (
  _params: DeleteSimFutureEventsParams = {},
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/events/future'

  if (debug) {
    console.debug(`DELETE ${url}`)
  }

  const response = await instance.delete(url)
  return response.data as DeleteSimFutureEventsResponse
}
