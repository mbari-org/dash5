// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface StartDeploymentParams {
  vehicle: string
  name: string
  tag: string
  date: string
}

export interface StartDeploymentResponse {
  result: string
}

export const startDeployment = async (
  params: StartDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments/start'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as StartDeploymentResponse
}
