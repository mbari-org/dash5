// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { filterBlankAttributes } from '@mbari/utils'
export interface StartDeploymentParams {
  vehicle: string
  name: string
  tag: string
  date: string
}

export interface StartDeploymentResponse {
  result: string
  date: string
  sentBy: string
  vehicle: string
  requestMessage: string
}

export const startDeployment = async (
  params: StartDeploymentParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/deployments/start'

  const completeUrl = `${url}?${new URLSearchParams(
    filterBlankAttributes({
      name: params.name,
      vehicle: params.vehicle,
      tag: params.tag,
      date: params.date,
    })
  )}`

  if (debug) {
    console.debug(`POST ${completeUrl}`)
  }

  const response = await instance.post(completeUrl, undefined, config)
  return response.data.result as StartDeploymentResponse
}
