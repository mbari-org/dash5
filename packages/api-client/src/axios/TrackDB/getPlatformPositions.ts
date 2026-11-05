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

  // Matches Dash4's Axios timeout (src/boot/axios.js). AIS platform position
  // queries (e.g. D_PACKARD, ShanaRae) can be slow; the old 5-s default caused
  // them to cancel, making assets temporarily disappear from the map (#837).
  const TRACKDB_POSITIONS_TIMEOUT_MS = 15000
  const response = await instance.get(url, {
    ...config,
    params: queryParams,
    timeout: TRACKDB_POSITIONS_TIMEOUT_MS,
  })
  return response.data as GetPlatformPositionsResponse
}
