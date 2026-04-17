import type { Override } from '../../axios/Util/extractOverrides'

export interface NormalizedMissionRun {
  /**
   * Same value as `generateMissionKey` for this run (mission path + overrides).
   * Consumers use this as the row id when the run has overrides; otherwise the
   * mission path alone is the id.
   */
  selectionId: string
  missionPath: string
  writtenCommand: string
  waypointOverrides: Override[]
  parameterOverrides: Override[]
  waypointCount: number
  parameterCount: number
  vehicle: string
}
