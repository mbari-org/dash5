import { toWatchDuration } from '../components/Reassignment'

describe('toWatchDuration', () => {
  it('converts whole hours', () => {
    expect(toWatchDuration('8')).toBe('PT8H0M')
  })

  it('converts decimal hours to hours and minutes', () => {
    expect(toWatchDuration('1.5')).toBe('PT1H30M')
  })

  it('normalizes minutes overflow: 1.999 → PT2H0M (not PT1H60M)', () => {
    expect(toWatchDuration('1.999')).toBe('PT2H0M')
  })

  it('normalizes minutes overflow: 0.999 → PT1H0M', () => {
    expect(toWatchDuration('0.999')).toBe('PT1H0M')
  })

  it('allows explicit zero hours', () => {
    expect(toWatchDuration('0')).toBe('PT0H0M')
  })

  it('returns undefined for empty string', () => {
    expect(toWatchDuration('')).toBeUndefined()
  })

  it('returns undefined for whitespace-only string', () => {
    expect(toWatchDuration('   ')).toBeUndefined()
  })

  it('returns undefined for non-numeric input', () => {
    expect(toWatchDuration('abc')).toBeUndefined()
  })

  it('returns undefined for negative hours', () => {
    expect(toWatchDuration('-1')).toBeUndefined()
  })
})
