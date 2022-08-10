import { filterBlankAttributes } from '@mbari/utils'
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GpsFix {
  latitude: number
  longitude: number
  date: string
}

export type EventType =
  | 'argoReceive'
  | 'command'
  | 'dataProcessed'
  | 'deploy'
  | 'emergency'
  | 'gpsFix'
  | 'launch'
  | 'logCritical'
  | 'logFault'
  | 'logImportant'
  | 'logPath'
  | 'note'
  | 'patch'
  | 'recover'
  | 'run'
  | 'sbdReceipt'
  | 'sbdReceive'
  | 'sbdSend'
  | 'tracking'

export interface GetEventsParams {
  vehicles: string[]
  from: string
  to?: string
  eventTypes?: EventType[]
  limit?: number
  noteMatches?: string
  ascending?: 'y' | 'n'
}

export interface GetEventsResponse {
  eventId: number
  vehicleName: string
  unixTime: number
  isoTime: string
  eventType: EventType
  state?: number
  user?: string
  note?: string
  component?: string
  text?: string
  name?: string
  fix?: GpsFix
  path?: string
  data?: string
  momsn?: number
  mtmsn?: number
  dataLen?: number
  refId?: number
  index?: number
}

export const getEvents = async (
  params: GetEventsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/events'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams(
      filterBlankAttributes({
        ...params,
        vehicles: params.vehicles.join(','),
        eventTypes: params.eventTypes?.join(','),
        limit: params.limit?.toString(),
      })
    )}`,
    config
  )
  return response.data.result as GetEventsResponse[]
}
