// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'
import { Logger } from './getLoggers'

export interface UpdateLoggerParams {
  name: string
  level: string
}

export interface UpdateLoggerResponse {
  logger: Logger
}

export const updateLogger = async (
  params: UpdateLoggerParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/util/logger'

  if (debug) {
    console.debug(`PUT ${url}`)
  }

  const response = await instance.put(url, params, config)
  return response.data as UpdateLoggerResponse
}
