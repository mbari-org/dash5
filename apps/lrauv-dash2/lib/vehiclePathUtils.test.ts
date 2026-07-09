import {
  deduplicateFixesByUnixTime,
  countDisplayedPositions,
} from './vehiclePathUtils'

const fix = (unixTime: number, extra?: object) => ({
  unixTime,
  latitude: 36.0,
  longitude: -122.0,
  ...extra,
})

describe('deduplicateFixesByUnixTime', () => {
  it('returns empty array for empty input', () => {
    expect(deduplicateFixesByUnixTime([])).toEqual([])
  })

  it('keeps all fixes when all unixTimes are unique', () => {
    const fixes = [fix(1000), fix(2000), fix(3000)]
    expect(deduplicateFixesByUnixTime(fixes)).toHaveLength(3)
  })

  it('removes exact duplicate unixTime entries, keeping the first occurrence', () => {
    const first = fix(1000, { latitude: 36.1 })
    const duplicate = fix(1000, { latitude: 36.9 })
    const other = fix(2000)
    const result = deduplicateFixesByUnixTime([first, duplicate, other])
    expect(result).toHaveLength(2)
    expect(result[0].latitude).toBe(36.1) // first occurrence kept
    expect(result[1].unixTime).toBe(2000)
  })

  it('removes multiple duplicate groups', () => {
    const fixes = [
      fix(1000),
      fix(1000),
      fix(2000),
      fix(2000),
      fix(2000),
      fix(3000),
    ]
    expect(deduplicateFixesByUnixTime(fixes)).toHaveLength(3)
  })

  it('preserves order of first occurrences', () => {
    const fixes = [fix(3000), fix(1000), fix(2000), fix(1000)]
    const result = deduplicateFixesByUnixTime(fixes)
    expect(result.map((f) => f.unixTime)).toEqual([3000, 1000, 2000])
  })
})

describe('countDisplayedPositions', () => {
  const fixes = [fix(1000), fix(2000), fix(3000), fix(4000), fix(5000)]

  it('returns full length when dimTime is not provided', () => {
    expect(countDisplayedPositions(fixes)).toBe(5)
  })

  it('returns full length when dimTime is null', () => {
    expect(countDisplayedPositions(fixes, null)).toBe(5)
  })

  it('returns full length when dimTime is 0', () => {
    expect(countDisplayedPositions(fixes, 0)).toBe(5)
  })

  it('returns full length when dimTime is negative', () => {
    expect(countDisplayedPositions(fixes, -1)).toBe(5)
  })

  it('counts only fixes at or before dimTime', () => {
    expect(countDisplayedPositions(fixes, 3000)).toBe(3)
  })

  it('returns 0 when dimTime is before all fixes', () => {
    expect(countDisplayedPositions(fixes, 500)).toBe(0)
  })

  it('returns full count when dimTime is after all fixes', () => {
    expect(countDisplayedPositions(fixes, 9999)).toBe(5)
  })

  it('includes the fix whose unixTime equals dimTime exactly', () => {
    expect(countDisplayedPositions(fixes, 2000)).toBe(2)
  })

  it('returns 0 for empty array regardless of dimTime', () => {
    expect(countDisplayedPositions([], 5000)).toBe(0)
  })
})
