// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface Logger {
  id: string
  name: string
  level: string
}

export interface GetLoggersParams {}

export interface GetLoggersResponse {
  loggers: Logger[]
}

export const getLoggers = async (
  params: GetLoggersParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/util/logger'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(
    `${url}?${new URLSearchParams({ ...params })}`,
    config
  )
  return response.data as GetLoggersResponse
}
