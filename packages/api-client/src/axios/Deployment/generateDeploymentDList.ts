// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GenerateDeploymentDListParams {
  deploymentId: string
}

export interface GenerateDeploymentDListResponse {
  result: string
}

export const generateDeploymentDList = async (
  params: GenerateDeploymentDListParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments/dlist'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as GenerateDeploymentDListResponse
}
