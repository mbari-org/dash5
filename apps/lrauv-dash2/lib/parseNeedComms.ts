import type { GetEventsResponse } from '@mbari/api-client'

// Priority order for keys
const priorityKeys = [
  'NeedCommsTime',
  'NeedCommsTimeTransit',
  'NeedCommsTimeInTransit',
  'NeedCommsTimeInTransect',
  'NeedCommsTimePatchMapping',
  'NeedCommsTimePatchTracking',
  'NeedCommsTimeMarginPatchTracking',
  'NeedCommsTimeVeryLong', // Assumes hours not minutes
]

/**
 * Scans a "got command" log line for any NeedCommsTime* key and extracts
 * the associated time value (in minutes). Uses a priority-ordered list of
 * keys, supports hours/minutes units, treats NeedCommsTimeVeryLong as hours
 * by default, and ignores scheduler-related lines. Returns null if no valid
 * positive duration is found.
 */
const extractMinutesFromText = (text: string): number | null => {
  // "got command" lines and exclude scheduler ("sched", "schedule")
  const lower = text.toLowerCase()
  if (!lower.includes('got command')) return null
  if (lower.includes('chedule')) return null

  for (const key of priorityKeys) {
    const re = new RegExp(
      String.raw`\.${key}\s+(-?\d+(?:\.\d+)?)(?:\s*(hour|hours|hr|hrs|h|min|minute|minutes))?`,
      'i'
    )
    const match = text.match(re)
    if (!match) continue
    const [, valueStr, unitStrRaw] = match
    const value = parseFloat(valueStr)
    if (Number.isNaN(value)) continue
    const unitStr = unitStrRaw?.toLowerCase() ?? ''
    const isHours =
      /VeryLong$/i.test(key) ||
      unitStr === 'h' ||
      unitStr === 'hr' ||
      unitStr === 'hrs' ||
      unitStr.includes('hour')
    const minutes = isHours ? Math.round(value * 60) : Math.round(value)
    if (minutes > 0) return minutes
  }
  return null
}

/**
 * Finds the most recent CommandExec/CommandLine event containing a valid
 * NeedCommsTime* instruction. Searches text/data/note fields newest-first,
 * extracts the duration via extractMinutesFromText, and returns the
 * resolved minutes along with the originating event metadata. Returns all
 * nulls if no matching command is found.
 */
export const parseNeedCommsSelection = (
  events: GetEventsResponse[]
): {
  minutes: number | null
  eventUnixTime: number | null
  eventText: string | null
  eventId: number | null
} => {
  // Sort by time ascending and scan most-recent first
  const sorted = [...events].sort(
    (a, b) => (a.unixTime ?? 0) - (b.unixTime ?? 0)
  )
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const e = sorted[i]
    if (e.name && !/^(CommandExec|CommandLine)$/i.test(e.name)) continue
    const sources = [e.data, e.text, e.note].filter(Boolean) as string[]
    for (const s of sources) {
      const minutes = extractMinutesFromText(s)
      if (minutes !== null)
        return {
          minutes,
          eventUnixTime: e.unixTime ?? null,
          eventText: s,
          eventId: e.eventId ?? null,
        }
    }
  }
  return { minutes: null, eventUnixTime: null, eventText: null, eventId: null }
}

/**
 * Looks through events from newest to oldest and extracts the mission name
 * from any line matching “Started mission <NAME>”. Searches text/data/note
 * fields and returns the mission name plus the associated event metadata.
 * Returns nulls when no mission start line is present.
 */
export const parseMissionNameSelection = (
  events: GetEventsResponse[]
): {
  missionName: string | null
  eventUnixTime: number | null
  eventText: string | null
} => {
  const sorted = [...events].sort(
    (a, b) => (a.unixTime ?? 0) - (b.unixTime ?? 0)
  )
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const e = sorted[i]
    const sources = [e.data, e.text, e.note].filter(Boolean) as string[]
    for (const s of sources) {
      const m = s.match(/Started\s+mission\s+([A-Za-z0-9_]+)/i)
      if (m && m[1]) {
        return {
          missionName: m[1],
          eventUnixTime: e.unixTime ?? null,
          eventText: s,
        }
      }
    }
  }
  return { missionName: null, eventUnixTime: null, eventText: null }
}
