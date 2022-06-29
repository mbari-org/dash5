// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { DeploymentEvent, DListResult } from './getLastDeployment'
export interface GetDeploymentsParams {
  vehicle?: string
  deploymentId?: string
}

export interface GetDeploymentsResponse {
  deploymentId: number
  vehicle: string
  name: string
  path: string
  startEvent?: DeploymentEvent
  recoverEvent?: DeploymentEvent
  launchEvent?: DeploymentEvent
  endEvent?: DeploymentEvent
  dlistResult?: DListResult
  // The lastEvent and active props are derived state and not part of the actual API response.
  lastEvent: number
  active: boolean
  present: boolean
}

export const getDeployments = async (
  params: GetDeploymentsParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data.result.map((result: GetDeploymentsResponse) => ({
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
  })) as GetDeploymentsResponse[]
}
