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
  destinationAddress?: string
}

export interface CreateCommandResponse {
  sentBy: string
  vehicle: string
  commandText: string
  commandNote: string
  schedDate: string
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

  const response = await instance.post(url, undefined, { ...config, params })
  return response.data.result as CreateCommandResponse
}
