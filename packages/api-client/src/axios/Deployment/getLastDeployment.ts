// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetLastDeploymentParams {
  /**
   * The name of the vehicle.
   */
  vehicle: string
  /**
   * An ISO 8601 formatted date string.
   */
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
  contents?: string
  messages?: string[]
}

export interface GetLastDeploymentResponse {
  deploymentId: string
  vehicle: string
  path: string
  name?: string
  startEvent?: DeploymentEvent
  recoverEvent?: DeploymentEvent
  launchEvent?: DeploymentEvent
  endEvent?: DeploymentEvent
  dlistResult: DListResult
  // The lastEvent and active props are derived state and not part of the actual API response.
  lastEvent: number
  active: boolean
  present: boolean
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
  const result = response.data?.result ?? {}
  return {
    ...result,
    active: result.name && !result.endEvent,
    present: !!result.name,
    lastEvent: [
      result.endEvent,
      result.recoverEvent,
      result.launchEvent,
      result.startEvent,
    ]
      .filter((i) => i)
      .map((i) => i?.unixTime)
      .sort()
      .reverse()[0],
  } as GetLastDeploymentResponse
}
