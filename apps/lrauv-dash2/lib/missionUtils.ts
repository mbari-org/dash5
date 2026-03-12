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
  const match = data?.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/i)
  if (!match) return ''
  const filename = match[0].split('/').pop() ?? ''
  return filename.replace(/\.(xml|tl)$/i, '')
}
