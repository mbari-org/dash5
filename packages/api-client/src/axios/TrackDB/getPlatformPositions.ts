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

// Matches Dash4's Axios timeout (src/boot/axios.js). AIS platform position
// queries (e.g. D_PACKARD, ShanaRae) can be slow; the old 5-s default caused
// them to cancel, making assets temporarily disappear from the map (#837).
// Intentionally hardcoded rather than reading API_TIMEOUT — this endpoint
// needs at least 15 s regardless of the global default.
// Tradeoff: a platform that genuinely fails will take up to 15 s to surface
// an error (was 5 s), but successful slow fetches no longer vanish.
export const TRACKDB_POSITIONS_TIMEOUT_MS = 15000

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

  const response = await instance.get(url, {
    ...config,
    params: queryParams,
    timeout: TRACKDB_POSITIONS_TIMEOUT_MS,
  })
  return response.data as GetPlatformPositionsResponse
}
