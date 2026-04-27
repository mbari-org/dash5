import '@testing-library/jest-dom'
import { DateTime } from 'luxon'
import {
  getNextCommsTimeFromUnixMs,
  getRelativeDurationInMinutesText,
} from './nextCommsTimeFormatting'

describe('getNextCommsTimeFromUnixMs', () => {
  it('returns 99:99 for undefined, null, or NaN', () => {
    expect(getNextCommsTimeFromUnixMs()).toBe('99:99')
    expect(getNextCommsTimeFromUnixMs(null)).toBe('99:99')
    expect(getNextCommsTimeFromUnixMs(NaN)).toBe('99:99')
  })

  it('formats a local timestamp as HH:mm (24-hour clock)', () => {
    const midnightLocal = DateTime.local(2020, 1, 1, 0, 0, 0).toMillis()
    expect(getNextCommsTimeFromUnixMs(midnightLocal)).toBe('00:00')
  })
})

describe('getRelativeDurationInMinutesText', () => {
  it('returns NA for undefined/null', () => {
    expect(getRelativeDurationInMinutesText()).toBe('NA')
    expect(getRelativeDurationInMinutesText(null)).toBe('NA')
  })

  it('returns in 0m for exactly zero duration', () => {
    expect(getRelativeDurationInMinutesText(0)).toBe('in 0m')
  })

  it('formats positive durations under a day', () => {
    const ninetyMinutes = 90 * 60 * 1000
    expect(getRelativeDurationInMinutesText(ninetyMinutes)).toBe('in 1h 30m')
  })

  it('includes days and hours but omits minutes when minutes are zero and days/hours exist', () => {
    const fortyNineHours = 49 * 60 * 60 * 1000 // 2d 1h
    expect(getRelativeDurationInMinutesText(fortyNineHours)).toBe('in 2d 1h')
  })

  it('formats negative durations as "ago"', () => {
    const thirtyMinutesAgo = -30 * 60 * 1000
    expect(getRelativeDurationInMinutesText(thirtyMinutesAgo)).toBe('30m ago')
  })

  it('caps very large durations with default 6-day limit', () => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    expect(getRelativeDurationInMinutesText(sevenDaysMs)).toBe('over 6 days')
  })

  it('respects a custom capDays value', () => {
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000
    expect(getRelativeDurationInMinutesText(twoDaysMs, 1)).toBe('over 1 days')
  })
})
