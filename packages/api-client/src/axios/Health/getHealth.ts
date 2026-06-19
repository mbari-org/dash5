import { AxiosInstance } from 'axios'
import { getInstance } from '../getInstance'

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
export const getHealth = async (instance?: AxiosInstance) => {
  const axios = instance ?? getInstance()
  const response = await axios.get('health')
  return response.data.result as GetHealthResponse
}
