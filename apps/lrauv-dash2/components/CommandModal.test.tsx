import {
  getFilteredUnitAbbreviations,
  UnitEntry,
  sortMissionPaths,
} from './CommandModal'

const TIME_UNITS: UnitEntry[] = [
  { name: 'second', abbreviation: 's', baseUnit: undefined },
  { name: 'millisecond', abbreviation: 'ms', baseUnit: 'second' },
  { name: 'microsecond', abbreviation: 'us', baseUnit: 'second' },
  { name: 'minute', abbreviation: 'min', baseUnit: 'second' },
  { name: 'hour', abbreviation: 'h', baseUnit: 'second' },
  { name: 'day', abbreviation: 'd', baseUnit: 'second' },
]

const LENGTH_UNITS: UnitEntry[] = [
  { name: 'meter', abbreviation: 'm', baseUnit: undefined },
  { name: 'centimeter', abbreviation: 'cm', baseUnit: 'meter' },
  { name: 'kilometer', abbreviation: 'km', baseUnit: 'meter' },
  { name: 'nautical_mile', abbreviation: 'nmi', baseUnit: 'meter' },
]

const ALL_UNITS = [...TIME_UNITS, ...LENGTH_UNITS]

describe('sortMissionPaths', () => {
  const paths = [
    'Science/sci2.tl',
    'Deprecated/Demo/old_mission.tl',
    'Engineering/test.tl',
    'Deprecated/BehaviorScripts/foo.xml',
    'Transport/transit.tl',
  ]

  test('sorts Deprecated/ paths to the bottom', () => {
    const sorted = [...paths].sort(sortMissionPaths)
    const firstDeprecated = sorted.findIndex((p) =>
      p.toLowerCase().startsWith('deprecated/')
    )
    const lastNonDeprecated = sorted.reduce(
      (acc, p, i) => (!p.toLowerCase().startsWith('deprecated/') ? i : acc),
      -1
    )
    expect(firstDeprecated).toBeGreaterThan(lastNonDeprecated)
  })

  test('keeps non-deprecated paths in alphabetical order', () => {
    const sorted = [...paths].sort(sortMissionPaths)
    const nonDeprecated = sorted.filter(
      (p) => !p.toLowerCase().startsWith('deprecated/')
    )
    expect(nonDeprecated).toEqual(
      [...nonDeprecated].sort((a, b) => a.localeCompare(b))
    )
  })

  test('keeps deprecated paths in alphabetical order among themselves', () => {
    const sorted = [...paths].sort(sortMissionPaths)
    const deprecated = sorted.filter((p) =>
      p.toLowerCase().startsWith('deprecated/')
    )
    expect(deprecated).toEqual(
      [...deprecated].sort((a, b) => a.localeCompare(b))
    )
  })
})

describe('getFilteredUnitAbbreviations', () => {
  test('returns all abbreviations when selectedArgUnit is undefined', () => {
    const result = getFilteredUnitAbbreviations(ALL_UNITS, undefined)
    expect(result).toEqual(ALL_UNITS.map((u) => u.abbreviation))
  })

  test('returns an empty array when unitsData is undefined', () => {
    const result = getFilteredUnitAbbreviations(undefined, 'meter')
    expect(result).toEqual([])
  })

  test('filters to compatible length units when parameter unit is "meter"', () => {
    const result = getFilteredUnitAbbreviations(ALL_UNITS, 'meter')
    expect(result).toEqual(['m', 'cm', 'km', 'nmi'])
    expect(result).not.toContain('s')
    expect(result).not.toContain('h')
  })

  test('resolves canonical base unit and filters time units when parameter unit is "hour"', () => {
    // hour.baseUnit = second, so canonical base = second
    const result = getFilteredUnitAbbreviations(ALL_UNITS, 'hour')
    expect(result).toContain('s')
    expect(result).toContain('h')
    expect(result).toContain('min')
    expect(result).not.toContain('m')
    expect(result).not.toContain('km')
  })

  test('sorts time units by abbreviation length so short forms appear first', () => {
    const result = getFilteredUnitAbbreviations(ALL_UNITS, 'hour')
    const lengths = result.map((a) => a.length)
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b))
    expect(result[0]).toBe('s')
  })

  test('falls back to all abbreviations when no compatible units are found', () => {
    const result = getFilteredUnitAbbreviations(ALL_UNITS, 'unknown_unit')
    expect(result).toEqual(ALL_UNITS.map((u) => u.abbreviation))
  })
})
