// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { GetLastDeploymentResponse } from './getLastDeployment'
import { GetEventsResponse, EventType } from '../Event/getEvents'

export interface GetCommandStatusParams {
  deploymentId: number
}

export interface CommandStatus {
  event: GetEventsResponse
  status: string
  relatedEvents: GetEventsResponse[]
}

export interface GetCommandStatusResponse {
  deploymentInfo: GetLastDeploymentResponse
  eventTypes: EventType[]
  commandStatuses: CommandStatus[]
}

export const getCommandStatus = async (
  params: GetCommandStatusParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments/commandStatus'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, { ...config, params })
  return {
    ...response.data.result,
    eventTypes: response.data.result.eventTypes.split(','),
  } as GetCommandStatusResponse
}
