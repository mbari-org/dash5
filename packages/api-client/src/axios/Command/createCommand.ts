// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface CreateCommandParams {
  vehicle: string
  path: string
  commandText: string
  commandNote: string
  runCommand: string
  schedDate: string
}

export interface CreateCommandResponse {
  result: string
}

export const createCommand = async (
  params: CreateCommandParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands'

  if (debug) {
    console.debug(`POST ${url}`)
  }

  const response = await instance.post(url, params, config)
  return response.data as CreateCommandResponse
}
