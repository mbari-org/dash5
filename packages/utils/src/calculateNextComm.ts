import {
  getRelativeDurationInMinutesText,
  getNextCommsTimeFromUnixMs,
} from './nextCommsTimeFormatting'

export interface NextCommResult {
  nextCommTimeMs: number | null
  text: string | null
}

// Calculates the timestamp of when the next comm should be scheduled
export const calculateNextCommMs = (
  satcommsMs: number | null | undefined,
  cellcommsMs: number | null | undefined,
  needCommsMinutes: number | null | undefined
): number | null => {
  const commRefTime = Math.max(satcommsMs ?? 0, cellcommsMs ?? 0)
  if (!commRefTime) return null
  const minutes =
    needCommsMinutes && needCommsMinutes > 0 ? needCommsMinutes : 60
  return commRefTime + minutes * 60 * 1000
}

// Calculates the timestamp of when the next comm should be scheduled relative to the current time
export const calculateRelativeNextComm = (
  satcommsMs: number | null | undefined,
  cellcommsMs: number | null | undefined,
  needCommsMinutes: number | null | undefined,
  nowMs: number
): NextCommResult => {
  const nextTime = calculateNextCommMs(
    satcommsMs,
    cellcommsMs,
    needCommsMinutes
  )
  if (!nextTime) return { nextCommTimeMs: null, text: null }
  return {
    nextCommTimeMs: nextTime,
    text: `${getNextCommsTimeFromUnixMs(
      nextTime
    )} - ${getRelativeDurationInMinutesText(nextTime - nowMs, 6)}`,
  }
}
