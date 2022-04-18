// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetLastDeploymentParams {
  vehicleName: string
  to: string
}

export interface DeploymentEvent {
  unixTime: number
  eventId: number
  note?: string
  state?: number
}

export interface DListResult {
  path: string
  messages: string[]
}

export interface GetLastDeploymentResponse {
  deploymentId: string
  vehicleName: string
  path: string
  name: string
  startEvent: DeploymentEvent
  recoverEvent: DeploymentEvent
  launchEvent: DeploymentEvent
  endEvent: DeploymentEvent
  dlistResult: DListResult
}

export const getLastDeployment = async (
  params: GetLastDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments/last'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data?.result as GetLastDeploymentResponse
}
