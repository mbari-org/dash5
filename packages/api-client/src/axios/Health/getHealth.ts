import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetHealthResponse {
  atIso: string
  asyncConnections: number
  freeMemory: number
  maxMemory: number
  totalMemory: number
  availableProcessors: number
  application: string
  version: string
  build: string
  appInstance: string
  javaVersion: string
}

// Health endpoint: GET /api/health on TethysDash.
export const getHealth = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = '/health'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data.result as GetHealthResponse
}
