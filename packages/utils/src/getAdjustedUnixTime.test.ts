import { getAdjustedUnixTime } from './getAdjustedUnixTime'
import { DateTime } from 'luxon'

describe('getAdjustedUnixTime', () => {
  // Known reference timestamp: January 15, 2023 12:30:45 UTC
  const referenceTimestamp = 1673786445000 // milliseconds

  it('should return the same timestamp when no offsets are provided', () => {
    expect(getAdjustedUnixTime({ unixTime: referenceTimestamp })).toBe(
      referenceTimestamp
    )
  })

  it('should add days correctly', () => {
    // Add 5 days
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ days: 5 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetDays: 5,
      })
    ).toBe(expectedTime)
  })

  it('should subtract days correctly', () => {
    // Subtract 3 days
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ days: -3 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetDays: -3,
      })
    ).toBe(expectedTime)
  })

  it('should add hours correctly', () => {
    // Add 8 hours
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ hours: 8 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetHours: 8,
      })
    ).toBe(expectedTime)
  })

  it('should subtract hours correctly', () => {
    // Subtract 12 hours
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ hours: -12 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetHours: -12,
      })
    ).toBe(expectedTime)
  })

  it('should add years correctly', () => {
    // Add 2 years
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ years: 2 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetYears: 2,
      })
    ).toBe(expectedTime)
  })

  it('should add months correctly', () => {
    // Add 3 months
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ months: 3 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetMonths: 3,
      })
    ).toBe(expectedTime)
  })

  it('should subtract months correctly', () => {
    // Subtract 2 months
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ months: -2 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetMonths: -2,
      })
    ).toBe(expectedTime)
  })

  it('should combine multiple offsets correctly', () => {
    // Add 3 days, subtract 5 hours, add 1 year
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ days: 3, hours: -5, years: 1 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetDays: 3,
        offsetHours: -5,
        offsetYears: 1,
      })
    ).toBe(expectedTime)
  })

  it('should set time to end of day when endOfDay is true', () => {
    // Expected: January 15, 2023 23:59:59.999 UTC
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .endOf('day')
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        endOfDay: true,
      })
    ).toBe(expectedTime)
  })

  it('should apply offsets and then set to end of day when both are specified', () => {
    // Add 2 days, then set to end of day
    const expectedTime = DateTime.fromMillis(referenceTimestamp, {
      zone: 'utc',
    })
      .plus({ days: 2 })
      .endOf('day')
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: referenceTimestamp,
        offsetDays: 2,
        endOfDay: true,
      })
    ).toBe(expectedTime)
  })

  it('should handle daylight saving time transitions correctly', () => {
    // March 12, 2023 01:30:00 UTC (before US DST spring forward)
    const dstTimestamp = 1678586400000

    // Add 1 day (crossing DST boundary in US, but in UTC it's irrelevant)
    const expectedTime = DateTime.fromMillis(dstTimestamp, { zone: 'utc' })
      .plus({ days: 1 })
      .toMillis()

    expect(
      getAdjustedUnixTime({
        unixTime: dstTimestamp,
        offsetDays: 1,
      })
    ).toBe(expectedTime)
  })
})
