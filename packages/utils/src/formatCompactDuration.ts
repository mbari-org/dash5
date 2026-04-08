import { DateTime } from 'luxon'

// Format a compact duration between a target time and a reference (default now):
// - "Xd Yh Zm", omitting zero-valued leading units, up to days
// - if maxDays is set and the duration exceeds it, returns ">Nd days"
// - if maxDays is undefined, falls back to years/months/days for long durations
export const formatCompactDuration = (
  target: DateTime,
  reference: DateTime = DateTime.now(),
  { maxDays }: { maxDays?: number } = {}
): string => {
  const earlier = target <= reference ? target : reference
  const later = target <= reference ? reference : target
  const daysTotal = later.diff(earlier, 'days').days

  if (maxDays !== undefined && daysTotal > maxDays)
    return `>${maxDays} ${maxDays === 1 ? 'day' : 'days'}`

  // For durations longer than 6 days with no cap, use human-readable units.
  // When maxDays is set, stay in the d/h/m format so the cap controls output shape.
  if (maxDays === undefined && daysTotal > 6) {
    const { years, months, days, hours } = later
      .diff(earlier, ['years', 'months', 'days', 'hours'])
      .toObject()
    const y = Math.trunc(years ?? 0)
    const mo = Math.trunc(months ?? 0)
    const d = Math.trunc(days ?? 0)
    const h = Math.trunc(hours ?? 0)
    if (y > 0) return mo > 0 ? `${y}y ${mo}mo` : `${y}y`
    if (mo > 0) return d > 0 ? `${mo}mo ${d}d` : `${mo}mo`
    return `${d + (h >= 12 ? 1 : 0)}d`
  }

  const diff = later.diff(earlier, ['days', 'hours', 'minutes']).toObject()
  const days = Math.trunc(diff.days ?? 0)
  const hours = Math.trunc(diff.hours ?? 0)
  const minutes = Math.trunc(diff.minutes ?? 0)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  if (minutes > 0 || (days === 0 && hours === 0)) parts.push(`${minutes}m`)

  return parts.join(' ')
}
