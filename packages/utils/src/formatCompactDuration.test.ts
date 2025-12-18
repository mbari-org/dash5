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

  it('caps at >6 days', () => {
    const ref = DateTime.fromISO('2024-01-01T00:00:00')
    const target = ref.plus({ days: 7 })
    expect(formatCompactDuration(target, ref)).toBe('>6 days')
  })

  it('is symmetric with respect to earlier/later ordering', () => {
    const a = DateTime.fromISO('2024-01-01T00:00:00')
    const b = a.plus({ days: 1, hours: 2, minutes: 3 })
    expect(formatCompactDuration(b, a)).toBe('1d 2h 3m')
    expect(formatCompactDuration(a, b)).toBe('1d 2h 3m')
  })
})
