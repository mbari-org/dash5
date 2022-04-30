import { DateTime } from 'luxon'

export const timeSinceStart = (startTime: string, addTime: number = 0) => {
  const start = DateTime.fromISO(startTime)
  const diff = start
    .plus({ seconds: addTime })
    .diffNow(['years', 'months', 'hours', 'days', 'minutes'])
  const years = Math.abs(Math.round(diff.years))
  const months = Math.abs(Math.round(diff.months))
  const days = Math.abs(diff.days + Math.round(diff.hours / 24))
  const hours = Math.abs(Math.round(diff.hours))

  if (years >= 1) return `${years}y`
  if (months >= 1) return `${months}m`
  return days >= 1 ? `${days}d` : `${hours}h`
}
