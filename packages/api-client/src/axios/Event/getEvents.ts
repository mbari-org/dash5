// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetEventsParams {
  vehicles: string
  from: string
  to: string
  eventTypes: string
  limit: number
  noteMatches: string
  ascending?: 'y' | 'n'
}

export interface GetEventsResponse {
  result: string
}

export const getEvents = async (
  params: GetEventsParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = '/events'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({
      ...params,
      limit: params.limit.toString(),
    })}`
  )
  return response.data as GetEventsResponse
}
