import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetPlatformPositionsParams {
  platformId: string
  lastNumberOfFixes?: number
  startDate?: string
  endDate?: string
}

export interface PlatformPosition {
  timeMs: number
  lat: number
  lon: number
}

export interface GetPlatformPositionsResponse {
  platformId: string
  platformName: string
  positions: PlatformPosition[]
}

export const getPlatformPositions = async (
  params: GetPlatformPositionsParams,
  {
    debug,
    instance = getInstance(),
    baseURL = '',
    ...config
  }: RequestConfig = {}
) => {
  const url = `${baseURL}/trackdb/platforms/${params.platformId}/positions`

  if (debug) {
    console.debug(`GET ${url}`)
  }

  const queryParams: Record<string, string | number> = {}
  if (params.lastNumberOfFixes !== undefined) {
    queryParams.lastNumberOfFixes = params.lastNumberOfFixes
  }
  if (params.startDate !== undefined) {
    queryParams.startDate = params.startDate
  }
  if (params.endDate !== undefined) {
    queryParams.endDate = params.endDate
  }

  const response = await instance.get(url, { ...config, params: queryParams })
  return response.data as GetPlatformPositionsResponse
}
