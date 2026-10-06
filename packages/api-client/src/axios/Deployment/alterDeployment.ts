/**
 * NOTE: This was abstracted from `deployment-button.vue:196`
 * from the lrauv-dash repo. It's unclear why this is necessary.
 */

// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface AlterDeploymentParams {
  deploymentId: number
  date: string
  note: string
  deploymentType: 'launch' | 'recover' | 'end'
}

export interface AlterDeploymentResponse {
  date: string
  sentBy: string
  vehicle: string
  note: string
  requestMessage: string
}

export const alterDeployment = async (
  { deploymentType, ...params }: AlterDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = `/deployments/${deploymentType}`

  if (debug) {
    console.debug(`POST ${url}`)
  }

  console.log('POSTING TO', url)

  // /deployments/end does not accept a note param — only send it for launch/recover
  const queryParams =
    deploymentType === 'end'
      ? { deploymentId: params.deploymentId, date: params.date }
      : params

  const response = await instance.post(url, undefined, {
    ...config,
    params: queryParams,
  })
  return response.data.result as AlterDeploymentResponse
}
