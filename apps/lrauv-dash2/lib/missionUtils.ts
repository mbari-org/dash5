export const normalizeMissionName = (missionName?: string): string => {
  if (!missionName) return ''
  const trimmed = missionName.trim()
  if (!trimmed) return ''
  const filename = trimmed.split('/').pop() ?? ''
  return filename.replace(/\.(xml|tl)$/i, '').toLowerCase()
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
 * Extracts the bare mission name from a run/command event data string.
 * e.g. "load Science/circle_acoustic_contact.tl;set ...;run" → "circle_acoustic_contact"
 */
export const missionNameFromEventData = (data?: string): string => {
  const withExtension = data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/i)?.[0]
  if (withExtension) {
    return (
      withExtension
        .split('/')
        .pop()
        ?.replace(/\.(xml|tl)$/i, '') ?? ''
    )
  }

  // Fallback for mission loads with no extension, e.g. "load Maintenance/calibration;run"
  const loadMatch = data?.match(/\bload\s+([A-Za-z0-9_/.-]+)\b/i)?.[1]
  if (!loadMatch) return ''
  return (
    loadMatch
      .split('/')
      .pop()
      ?.replace(/\.(xml|tl)$/i, '') ?? ''
  )
}

export const missionPathFromEventData = (data?: string): string => {
  const withExtension = data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/i)?.[0]
  if (withExtension) return normalizeMissionPath(withExtension)

  // Fallback for mission loads with no extension, e.g. "load Maintenance/calibration;run"
  const loadMatch = data?.match(/\bload\s+([A-Za-z0-9_/.-]+)\b/i)?.[1]
  if (!loadMatch) return ''
  return normalizeMissionPath(loadMatch)
}
