import {
  deduplicateFixesByUnixTime,
  countDisplayedPositions,
  recentPositionsWithinWindow,
  lrauvsRootHoverPositions,
  RECENT_POSITION_WINDOW_MS,
  RECENT_POSITION_CAP,
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

describe('recentPositionsWithinWindow', () => {
  const now = 1_000_000_000_000

  it('returns empty for no points', () => {
    expect(recentPositionsWithinWindow(undefined, now)).toEqual([])
    expect(recentPositionsWithinWindow([], now)).toEqual([])
  })

  it('keeps only points inside the last 24 hours, newest first', () => {
    const inside = fix(now - 60_000)
    const older = fix(now - RECENT_POSITION_WINDOW_MS - 1)
    const earlierToday = fix(now - 2 * 60 * 60 * 1000)
    const result = recentPositionsWithinWindow(
      [older, earlierToday, inside],
      now
    )
    expect(result.map((p) => p.unixTime)).toEqual([
      inside.unixTime,
      earlierToday.unixTime,
    ])
  })

  it('keeps a point a few minutes ahead of now', () => {
    const ahead = fix(now + 5 * 60 * 1000)
    expect(recentPositionsWithinWindow([ahead], now)).toEqual([ahead])
  })

  it('stops at 20 even when more points fall inside the window', () => {
    const points = Array.from({ length: RECENT_POSITION_CAP + 5 }, (_, i) =>
      fix(now - i * 60_000)
    )
    expect(recentPositionsWithinWindow(points, now)).toHaveLength(
      RECENT_POSITION_CAP
    )
  })
})

describe('lrauvsRootHoverPositions', () => {
  const now = 1_000_000_000_000

  it('returns empty when nothing is loaded', () => {
    expect(lrauvsRootHoverPositions({ now })).toEqual([])
  })

  it('keeps recent points from other position leaves and drops older ones', () => {
    const recent = now - 60_000
    const older = now - RECENT_POSITION_WINDOW_MS - 1
    const result = lrauvsRootHoverPositions({
      now,
      gpsFixes: [fix(recent, { latitude: 1, longitude: 2 })],
      argos: [fix(older, { latitude: 3, longitude: 4 })],
      navigatingToWaypoints: [fix(recent, { latitude: 5, longitude: 6 })],
      reachedWaypoints: [fix(recent, { latitude: 7, longitude: 8 })],
      emergencies: [fix(older, { latitude: 9, longitude: 10 })],
    })
    expect(result).toEqual([
      [1, 2],
      [5, 6],
      [7, 8],
    ])
  })

  it('includes GPS fixes older than 24h to match map rendering (cap-only, no time window)', () => {
    const older = now - RECENT_POSITION_WINDOW_MS - 1
    const result = lrauvsRootHoverPositions({
      now,
      gpsFixes: [fix(older, { latitude: 1, longitude: 2 })],
      argos: [fix(older, { latitude: 3, longitude: 4 })],
    })
    // GPS fixes are included (no time window); Argos is dropped (24h window)
    expect(result).toEqual([[1, 2]])
  })

  it('includes the latest waypoint position and every waypoint', () => {
    const result = lrauvsRootHoverPositions({
      now,
      latestWaypointPosition: { lat: 36.1, lon: -121.1 },
      waypoints: [
        { lat: 36.2, lon: -121.2 },
        { lat: 36.3, lon: -121.3 },
      ],
    })
    expect(result).toEqual([
      [36.1, -121.1],
      [36.2, -121.2],
      [36.3, -121.3],
    ])
  })

  it('stops each position leaf at 20', () => {
    const gpsFixes = Array.from({ length: RECENT_POSITION_CAP + 3 }, (_, i) =>
      fix(now - i * 60_000, { latitude: i, longitude: i })
    )
    const result = lrauvsRootHoverPositions({ now, gpsFixes })
    expect(result).toHaveLength(RECENT_POSITION_CAP)
    expect(result[0]).toEqual([0, 0])
  })
})
