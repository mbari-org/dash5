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

// Health lives at /api/health on TethysDash. When called via the shared
// axiosInstance (baseURL = .../TethysDash/api), 'health' (no leading slash)
// appends correctly → .../TethysDash/api/health.
export const getHealth = async ({
  debug,
  instance = getInstance(),
  ...config
}: RequestConfig = {}) => {
  const url = 'health'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const response = await instance.get(url, config)
  return response.data.result as GetHealthResponse
}
