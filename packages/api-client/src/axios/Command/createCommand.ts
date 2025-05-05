// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CreateCommandParams {
  vehicle: string
  path?: string
  commandText: string
  commandNote: string
  runCommand?: string
  schedDate: string
  via?: string
  timeout?: number
  destinationAddress?: string
}

export interface CreateCommandResponse {
  sentBy: string
  vehicle: string
  commandText: string
  commandNote: string
  schedDate: string
  via: string
  timeout: number
  destinationAddress: string
  runCommand: boolean
  schedId: string
}

export const createCommand = async (
  params: CreateCommandParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  // If via is 'sat', ensure timeout is undefined
  const processedParams = { ...params }
  if (processedParams.via === 'sat') {
    processedParams.timeout = undefined
  }

  const response = await instance.post(url, undefined, {
    ...config,
    params: processedParams,
  })
  return response.data.result as CreateCommandResponse
}
