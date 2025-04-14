import { DateTime } from 'luxon'

/**
 * Applies an offset in days or hours to a Unix timestamp while maintaining UTC time.
 * Optionally adjusts the timestamp to the end of the day.
 *
 * @param unixTime - Unix timestamp in milliseconds.
 * @param offsetDays - Optional number of days to adjust the date. Positive values add days, negative values subtract.
 * @param offsetHours - Optional number of hours to adjust the date. Positive values add hours, negative values subtract.
 * @param offsetMonths - Optional number of months to adjust the date. Positive values add months, negative values subtract.
 * @param offsetYears - Optional number of years to adjust the date. Positive values add years, negative values subtract.
 * @param endOfDay - Optional boolean to adjust the time to the end of the day after applying offsets. Defaults to false.
 * @returns The adjusted Unix timestamp in milliseconds.
 */
export const getAdjustedUnixTime = ({
  unixTime,
  offsetDays = 0,
  offsetHours = 0,
  offsetMonths = 0,
  offsetYears = 0,
  endOfDay = false,
}: {
  unixTime: number
  offsetDays?: number
  offsetHours?: number
  offsetMonths?: number
  offsetYears?: number
  endOfDay?: boolean
}): number => {
  let dateTime = DateTime.fromMillis(unixTime, { zone: 'utc' }).plus({
    days: offsetDays,
    hours: offsetHours,
    months: offsetMonths,
    years: offsetYears,
  })

  if (endOfDay) {
    dateTime = dateTime.endOf('day')
  }

  return dateTime.toMillis()
}
