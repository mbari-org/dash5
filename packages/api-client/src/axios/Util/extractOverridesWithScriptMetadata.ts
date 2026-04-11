import type { GetScriptResponse } from '../Command/getScript'
import {
  extractOverrides,
  type Override,
  type Overrides,
} from './extractOverrides'

/**
 * True when parameter override names look like latitude/longitude but may need
 * script metadata to classify as waypoints vs mission parameters (e.g. CenterLat).
 */
const NONSTANDARD_LAT_LON_IN_PARAM_NAME = /(Lat(?:itude)?|Lon(?:gitude)?)/i

export const hasNonstandardLatLonInParameterOverrides = (
  parameterOverrides: Override[]
): boolean =>
  parameterOverrides.some(({ name }) =>
    NONSTANDARD_LAT_LON_IN_PARAM_NAME.test(name)
  )

export type FetchMissionScriptMetadata = () => Promise<GetScriptResponse>

export type ExtractOverridesWithScriptMetadataOptions = {
  /** Included in the console log when script metadata fetch fails */
  logContext?: string
}

/**
 * Parses `commandText` into waypoint vs parameter overrides. When overrides
 * contain ambiguous lat/lon-like parameter names and `missionPath` + `fetchScript`
 * are provided, fetches script metadata and re-runs classification with
 * `latLonNamePairs`.
 */
export async function extractOverridesWithScriptMetadata(
  commandText: string,
  missionPath: string | undefined,
  fetchScript: FetchMissionScriptMetadata | undefined,
  options?: ExtractOverridesWithScriptMetadataOptions
): Promise<Overrides> {
  let { waypointOverrides, parameterOverrides } = extractOverrides(commandText)

  const shouldRefine =
    !!missionPath &&
    !!fetchScript &&
    hasNonstandardLatLonInParameterOverrides(parameterOverrides)

  if (!shouldRefine) {
    return { waypointOverrides, parameterOverrides }
  }

  try {
    const script = await fetchScript()
    if (script.latLonNamePairs?.length) {
      return extractOverrides(commandText, script.latLonNamePairs)
    }
  } catch (err) {
    const ctx = options?.logContext ?? missionPath
    console.log('Could not fetch script metadata for mission:', ctx, err)
  }

  return { waypointOverrides, parameterOverrides }
}
