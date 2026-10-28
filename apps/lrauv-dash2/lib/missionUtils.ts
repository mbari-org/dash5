export const normalizeMissionName = (missionName?: string): string => {
  if (!missionName) return ''
  const trimmed = missionName.trim()
  if (!trimmed) return ''
  const filename = trimmed.split('/').pop() ?? ''
  // Explicit fallback: strip the MBARI vehicle-tailored suffix (_vt) so that
  // a file named "profile_station_vt.tl" still matches telemetry that reports
  // "Started mission profile_station" when the getScript lookup has not yet
  // resolved.  Callers that have a scriptIdByPath entry will use the canonical
  // script ID directly and never reach this strip.
  return filename
    .replace(/\.(xml|tl)$/i, '')
    .replace(/_vt$/i, '')
    .toLowerCase()
}

export const normalizeMissionPath = (missionName?: string): string => {
  if (!missionName) return ''
  const trimmed = missionName.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\.(xml|tl)$/i, '').toLowerCase()
}

/**
 * Extracts the bare mission name from a mission-started text field.
 * e.g. "Started mission circle_acoustic_contact" → "circle_acoustic_contact"
 */
export const missionNameFromStartedText = (text: string): string =>
  text.replace(/^Started mission\s+/i, '').trim()

/**
 * Extracts the raw mission path from a run/command event data string,
 * preserving original case and file extension.
 * e.g. "load Science/profile_station_vt.tl;run" → "Science/profile_station_vt.tl"
 * e.g. "load Maintenance/calibration;run"       → "Maintenance/calibration"
 *
 * This is the single source of truth for path extraction. All other event-data
 * helpers delegate to it so the regex only lives in one place.
 */
export const rawMissionPathFromEventData = (data?: string): string => {
  const withExtension = data?.match(/[A-Za-z0-9_/.-]+\.(?:xml|tl)/i)?.[0]
  if (withExtension) return withExtension

  // Fallback for extensionless loads, e.g. "load Maintenance/calibration;run"
  const loadMatch = data?.match(/\bload\s+([A-Za-z0-9_/.-]+)\b/i)?.[1]
  return loadMatch ?? ''
}

/**
 * Extracts the bare mission name from a run/command event data string.
 * e.g. "load Science/circle_acoustic_contact.tl;set ...;run" → "circle_acoustic_contact"
 * e.g. "load Maintenance/calibration;run"                    → "calibration"
 */
export const missionNameFromEventData = (data?: string): string => {
  const raw = rawMissionPathFromEventData(data)
  if (!raw) return ''
  return (
    raw
      .split('/')
      .pop()
      ?.replace(/\.(xml|tl)$/i, '') ?? ''
  )
}

/**
 * Extracts and normalizes the mission path for internal matching.
 * e.g. "load Science/Profile_Station.tl;run"   → "science/profile_station"
 * e.g. "load Maintenance/calibration;run"       → "maintenance/calibration"
 */
export const missionPathFromEventData = (data?: string): string => {
  const raw = rawMissionPathFromEventData(data)
  return raw ? normalizeMissionPath(raw) : ''
}

/**
 * Given a raw event field string (e.g. "load Science/profile_station_vt.tl;run"),
 * extracts the mission file path and looks it up in the provided scriptIdByPath map.
 * Returns the canonical script ID (e.g. "profile_station") or undefined if not found.
 *
 * Used by both the mission-correlation (matching) path and the display-name chain so
 * the two callers stay in sync automatically.
 */
export const scriptIdFromEventField = (
  field: string | undefined,
  scriptIdByPath: Map<string, string>
): string | undefined => {
  const raw = rawMissionPathFromEventData(field)
  return raw ? scriptIdByPath.get(raw) : undefined
}
