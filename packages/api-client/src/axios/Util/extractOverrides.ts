/**
 * Extracts waypoint and parameter overrides from mission command data.
 *
 * This function parses command strings that follow these patterns:
 * - `set [prefix].[name] [value]`
 * - `[prefix]:[name.name] [value]`
 *
 * It splits the commands into two categories:
 * - waypointOverrides: commands where the value includes 'degree' as a unit
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

export const extractOverrides = (missionData: string): Overrides => {
  const regex = /(?:set\s+)?([\w]+)[.:]([\w.]+)\s+([^;"]+)/g
  const commands: Override[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(missionData)) !== null) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, _prefix, name, value] = match
    commands.push({ name, value: value.trim() })
  }

  return {
    waypointOverrides: commands.filter((cmd) => cmd.value.includes('degree')),
    parameterOverrides: commands.filter((cmd) => !cmd.value.includes('degree')),
  }
}
