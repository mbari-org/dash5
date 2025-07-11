/**
 * Extracts waypoint and parameter overrides from mission command data.
 *
 * This function parses command strings that follow these patterns:
 * - `set [prefix].[name] [value]`
 * - `[prefix]:[name.name] [value]`
 *
 * It splits the commands into two categories:
 * - waypointOverrides: commands where the value includes either a standard lat/lon name or a lat/lon name pair from the script metadata
 * - parameterOverrides: all other commands
 *
 * @param missionData - The raw command data string containing set commands
 * @returns An object containing arrays of waypoint and parameter overrides
 *
 * @example
 * const data = "set PAM.Lat1 -121.847 degree; PAM:BackseatDriver.EnableBackseat 1 bool"
 * const { waypointOverrides, parameterOverrides } = extractOverrides(data)
 * // waypointOverrides: [{ name: "Lat1", value: "-121.847 degree" }]
 * // parameterOverrides: [{ name: "BackseatDriver.EnableBackseat", value: "1 bool" }]
 */

export type Override = {
  name: string
  value: string
}

export type Overrides = {
  waypointOverrides: Override[]
  parameterOverrides: Override[]
}

// Helper to classify commands into waypoint / parameter groups
const classifyOverrides = (
  commands: Override[],
  latLonNamePairs?: { latName: string; lonName: string }[]
): Overrides => {
  // Helper regexes to capture latitude / longitude names and their values
  const latRe = /^(?:Lat(?:itude)?)(\d*)$/i
  const lonRe = /^(?:Lon(?:gitude)?)(\d*)$/i

  // Build a set of waypoint argument names
  const waypointNames = new Set<string>()

  // Check for standard Lat/Lon names
  const latNames = commands.map((c) => c.name).filter((n) => latRe.test(n))
  latNames.forEach((latName) => {
    const suffix = latName.match(latRe)?.[1] ?? ''
    const lonName = commands
      .map((c) => c.name)
      .find((n) => {
        const m = n.match(lonRe)
        return m && (m[1] ?? '') === suffix
      })
    if (lonName) {
      waypointNames.add(latName)
      waypointNames.add(lonName)
    }
  })

  // Add in nonstandard Lat / Lon pairs from script metadata since it is not obvious which are lat/lon pairs (ie CenterLat is param not a waypoint)
  if (latLonNamePairs) {
    latLonNamePairs.forEach(({ latName, lonName }) => {
      waypointNames.add(latName)
      waypointNames.add(lonName)
    })
  }

  return {
    waypointOverrides: commands.filter((c) => waypointNames.has(c.name)),
    parameterOverrides: commands.filter((c) => !waypointNames.has(c.name)),
  }
}

export const extractOverrides = (
  missionData: string,
  latLonNamePairs?: { latName: string; lonName: string }[]
): Overrides => {
  const regex = /(?:set\s+)?([\w]+)[.:]([\w.]+)\s+([^;"]+)/g
  const commands: Override[] = []

  for (const [, , name, value] of missionData.matchAll(regex)) {
    const cleaned = value.trim().split(/\s+/)[0] // keep value, drop units
    commands.push({ name, value: cleaned })
  }

  return classifyOverrides(commands, latLonNamePairs)
}
