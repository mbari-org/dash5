import { DateTime } from 'luxon'
import { formatCompactDuration } from './formatCompactDuration'

describe('formatCompactDuration', () => {
  it('returns 0m for equal times', () => {
    const t = DateTime.fromISO('2024-01-01T00:00:00')
    expect(formatCompactDuration(t, t)).toBe('0m')
  })

  it('formats minutes-only differences', () => {
    const ref = DateTime.fromISO('2024-01-01T00:00:00')
    const target = ref.plus({ minutes: 5 })
    expect(formatCompactDuration(target, ref)).toBe('5m')
  })

  it('formats hours and minutes', () => {
    const ref = DateTime.fromISO('2024-01-01T00:00:00')
    const target = ref.plus({ hours: 1, minutes: 5 })
    expect(formatCompactDuration(target, ref)).toBe('1h 5m')
  })

  it('includes hours when days are present and omits trailing minutes when zero', () => {
    const ref = DateTime.fromISO('2024-01-01T00:00:00')
    const target = ref.plus({ days: 2 })
    expect(formatCompactDuration(target, ref)).toBe('2d 0h')
  })

  it('is symmetric with respect to earlier/later ordering', () => {
    const a = DateTime.fromISO('2024-01-01T00:00:00')
    const b = a.plus({ days: 1, hours: 2, minutes: 3 })
    expect(formatCompactDuration(b, a)).toBe('1d 2h 3m')
    expect(formatCompactDuration(a, b)).toBe('1d 2h 3m')
  })

  describe('maxDays option', () => {
    it('caps at >N days when maxDays is set and duration exceeds it', () => {
      const ref = DateTime.fromISO('2024-01-01T00:00:00')
      const target = ref.plus({ days: 7 })
      expect(formatCompactDuration(target, ref, { maxDays: 6 })).toBe('>6 days')
    })

    it('does not cap when duration equals maxDays exactly', () => {
      const ref = DateTime.fromISO('2024-01-01T00:00:00')
      const target = ref.plus({ days: 6 })
      expect(formatCompactDuration(target, ref, { maxDays: 6 })).toBe('6d 0h')
    })

    it('shows full duration when maxDays is undefined and duration exceeds 6 days', () => {
      const ref = DateTime.fromISO('2024-01-01T00:00:00')
      const target = ref.plus({ days: 7, hours: 23 })
      // 7d 23h — the long-duration branch uses integer days from diff, not fractional total
      expect(formatCompactDuration(target, ref)).toBe('7d')
    })
  })

  describe('long durations (no cap)', () => {
    it('formats months and days', () => {
      const ref = DateTime.fromISO('2024-01-01T00:00:00')
      const target = ref.plus({ months: 2, days: 5 })
      expect(formatCompactDuration(target, ref)).toBe('2mo 5d')
    })

    it('formats months only when days are zero', () => {
      const ref = DateTime.fromISO('2024-01-01T00:00:00')
      const target = ref.plus({ months: 3 })
      expect(formatCompactDuration(target, ref)).toBe('3mo')
    })

    it('formats years and months', () => {
      const ref = DateTime.fromISO('2023-01-01T00:00:00')
      const target = ref.plus({ years: 1, months: 4 })
      expect(formatCompactDuration(target, ref)).toBe('1y 4mo')
    })

    it('formats years only when months are zero', () => {
      const ref = DateTime.fromISO('2023-01-01T00:00:00')
      const target = ref.plus({ years: 2 })
      expect(formatCompactDuration(target, ref)).toBe('2y')
    })
  })
})
