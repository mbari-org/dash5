import { DateTime } from 'luxon'

export const getNextCommsTimeFromUnixMs = (
  unixTimeMs?: number | null
): string => {
  if (!unixTimeMs || Number.isNaN(unixTimeMs)) return '99:99'
  const dt = DateTime.fromMillis(unixTimeMs)
  if (!dt.isValid) return '99:99'
  return dt.toFormat('hh:mm')
}

export const getRelativeDurationInMinutesText = (
  rawDurationMs?: number | null,
  capDays: number = 6
): string => {
  if (!rawDurationMs && rawDurationMs !== 0) return 'NA'

  const capMs = capDays * 24 * 60 * 60 * 1000
  const absMs = Math.abs(rawDurationMs)
  if (absMs > capMs) return `over ${capDays} days`

  const totalMinutes = Math.floor(absMs / (60 * 1000))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hoursPart = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutesPart = totalMinutes % 60

  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hoursPart) parts.push(`${hoursPart}h`)
  if (minutesPart || parts.length === 0) parts.push(`${minutesPart}m`)

  const base = parts.join(' ')
  return rawDurationMs < 0 ? `${base} ago` : `in ${base}`
}
