// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetMissionStartedEventParams {
  vehicle: string
  to?: string
  limit?: number
}

export interface Coord {
  latitude: number
  longitude: number
}

export interface GetMissionStartedEventResponse {
  eventId: number
  eventType: string
  vehicleName: string
  unixTime: number
  isoTime: string
  fix: Coord
  state: number
  dataLen: number
  refId: number
  index: number
  component: string
  text: string
}

export const getMissionStartedEvent = async (
  params: GetMissionStartedEventParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/events/mission-started'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({
      ...params,
      limit: params.limit?.toString() ?? '1',
    })}`,
    config
  )
  return response.data.result as GetMissionStartedEventResponse[]
}
