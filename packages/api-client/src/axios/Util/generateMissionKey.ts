import { Override } from './extractOverrides'

/**
 * Represents a mission run configuration including the mission name
 * and any overrides applied to waypoints and parameters.
 */
export interface MissionRun {
  missionName: string
  waypointOverrides: Override[]
  parameterOverrides: Override[]
}

/**
 * Generates a unique key for a mission run based on its configuration.
 * The key is created by combining the mission name and all overrides in a deterministic order.
 * This ensures that identical mission configurations will generate the same key,
 * allowing for deduplication of mission runs.
 *
 * @param run - The mission run configuration to generate a key for
 * @returns A string key that uniquely identifies the mission configuration
 */
export const generateMissionKey = (run: MissionRun): string => {
  // Sort overrides to ensure consistent ordering
  const sortedWaypointOverrides = [...run.waypointOverrides].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const sortedParameterOverrides = [...run.parameterOverrides].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // Create a string representation of all overrides
  const waypointOverrideString = sortedWaypointOverrides
    .map((override) => `${override.name}:${override.value}`)
    .join('|')

  const parameterOverrideString = sortedParameterOverrides
    .map((override) => `${override.name}:${override.value}`)
    .join('|')

  // Combine all fields into a single string
  return `${run.missionName}|${waypointOverrideString}|${parameterOverrideString}`
}
