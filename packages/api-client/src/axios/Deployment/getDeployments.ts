// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetDeploymentsParams {
  vehicleName?: string
  deploymentId?: string
}

export interface GetDeploymentsResponse {
  result: string
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
  return response.data as GetDeploymentsResponse
}
