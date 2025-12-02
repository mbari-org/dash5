import { DateTime } from 'luxon'

// Format a compact duration between a target time and a reference (default now):
// - "Xd Yh Zm", omitting zero-valued leading units
// - include days when present
// - if over 6 days, return ">6 days"
export const formatCompactDuration = (
  target: DateTime,
  reference: DateTime = DateTime.now()
): string => {
  const earlier = target <= reference ? target : reference
  const later = target <= reference ? reference : target
  const daysTotal = later.diff(earlier, 'days').days
  if (daysTotal > 6) return '>6 days'

  const d = later.diff(earlier, ['days', 'hours', 'minutes']).toObject()
  const days = Math.trunc(d.days ?? 0)
  const hours = Math.trunc(d.hours ?? 0)
  const minutes = Math.trunc(d.minutes ?? 0)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  if (minutes > 0 || (days === 0 && hours === 0)) parts.push(`${minutes}m`)

  return parts.join(' ')
}
