/**
 * NOTE: This was abstracted from `deployment-button.vue:196`
 * from the lrauv-dash repo. It's unclear why this is necessary.
 */

// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface AlterDeploymentParams {
  deploymentId: string
  date: string
  note: string
  deploymentType: string
}

export interface AlterDeploymentResponse {
  result: string
}

export const alterDeployment = async (
  { deploymentType, ...params }: AlterDeploymentParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = `/deployments/${deploymentType}`

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params)
  return response.data as AlterDeploymentResponse
}
