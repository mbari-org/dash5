/**
 * Formats elapsed time in milliseconds to a compact string format.
 *
 * @param elapsedMs - Elapsed time in milliseconds (can be negative for future times)
 * @returns Formatted string (e.g., "45s", "23m", "5h:30m", "48h", "5d:12h", "6M", "2y")
 *
 * Format rules:
 * - 0-99 seconds: "Xs" (e.g., "45s")
 * - 0-99 minutes: "Xm" (e.g., "23m")
 * - 0-24 hours: "Xh:Ym" (e.g., "5h:30m")
 * - 1-3 days: "Xh" (e.g., "48h")
 * - 1-99 days: "Xd:Yh" (e.g., "5d:12h")
 * - 1-24 months: "XM" (e.g., "6M")
 * - 1+ years: "Xy" (e.g., "2y")
 */
export function formatElapsedTime(elapsedMs: number): string {
  const ms = Math.abs(elapsedMs)
  const seconds = ms / 1000.0

  // 0-99 seconds: "Xs"
  if (seconds <= 99) {
    return `${Math.round(seconds)}s`
  }

  const minutes = seconds / 60.0

  // 0-99 minutes: "Xm"
  if (minutes <= 99) {
    return `${Math.round(minutes)}m`
  }

  const hoursF = minutes / 60.0

  // 0-24 hours: "Xh:Ym" or "Xh"
  if (hoursF <= 24) {
    const hours = Math.floor(hoursF)
    const remMins = Math.floor((hoursF - hours) * 60.0)
    return remMins > 0 ? `${hours}h:${remMins}m` : `${hours}h`
  }

  // 1-3 days (24-72 hours): "Xh"
  if (hoursF <= 72) {
    return `${Math.round(hoursF)}h`
  }

  const daysF = hoursF / 24.0
  const days = Math.floor(daysF)

  // 1-99 days: "Xd:Yh" or "Xd"
  if (days <= 99) {
    const remHours = Math.floor((daysF - days) * 24.0)
    return remHours > 0 ? `${days}d:${remHours}h` : `${days}d`
  }

  // 1-24 months: "XM"
  const months = daysF / 30.0
  if (months <= 24) {
    return `${Math.round(months)}M`
  }

  // 1+ years: "Xy"
  const years = Math.round(daysF / 365.0)
  return `${years}y`
}
