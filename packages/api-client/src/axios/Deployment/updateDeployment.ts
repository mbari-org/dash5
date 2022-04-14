// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface UpdateDeploymentParams {
  startDate: string
  launchDate: string
  launchNote: string
  recoverDate: string
  recoverNote: string
  endDate: string
  name: string
  tag: string
}

export interface UpdateDeploymentResponse {
  result: string
}

export const updateDeployment = async (
  params: UpdateDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as UpdateDeploymentResponse
}
