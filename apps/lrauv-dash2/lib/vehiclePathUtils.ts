/**
 * Pure utility functions extracted from VehiclePath so they can be
 * unit-tested without a Leaflet/DOM environment.
 */

/**
 * Deduplicate an array of GPS fixes by unixTime, keeping the first occurrence.
 * The TethysDash API occasionally returns duplicate entries with the same
 * timestamp, which causes React duplicate-key warnings when used as keys.
 */
export function deduplicateFixesByUnixTime<T extends { unixTime: number }>(
  fixes: T[]
): T[] {
  const seen = new Set<number>()
  return fixes.filter((fix) => {
    if (seen.has(fix.unixTime)) return false
    seen.add(fix.unixTime)
    return true
  })
}

/**
 * Count how many deduplicated fixes fall within the rendered segment.
 * When dimTime is active (track-split mode), only fixes at or before
 * that threshold are counted — matching what is actually rendered.
 * `displayedFixes` must already be deduplicated before being passed in.
 */
export function countDisplayedPositions<T extends { unixTime: number }>(
  displayedFixes: T[],
  dimTime?: number | null
): number {
  if (!dimTime || dimTime <= 0) return displayedFixes.length
  return displayedFixes.filter((fix) => fix.unixTime <= dimTime).length
}

/** Dash4 position window: last 24 hours, 20 is only the ceiling. */
export const RECENT_POSITION_WINDOW_MS = 24 * 60 * 60 * 1000
export const RECENT_POSITION_CAP = 20

/**
 * Newest positions inside the last `windowMs`, at most `cap`.
 * A point a few minutes ahead of `now` is kept. Older points are dropped.
 */
export function recentPositionsWithinWindow<T extends { unixTime: number }>(
  points: T[] | undefined,
  now: number,
  windowMs = RECENT_POSITION_WINDOW_MS,
  cap = RECENT_POSITION_CAP
): T[] {
  if (!points?.length || cap <= 0) return []
  const cutoff = now - windowMs
  return points
    .filter((point) => point.unixTime >= cutoff)
    .sort((a, b) => b.unixTime - a.unixTime)
    .slice(0, cap)
}

type LatLonTime = { latitude: number; longitude: number; unixTime: number }

/**
 * Points highlighted when the pointer is on the LRAUVs row.
 * Dash4 includes every leaf, checked or not. Position leaves use the
 * last-24-hour window. Waypoints are the latest position plus the full list.
 */
export function lrauvsRootHoverPositions(args: {
  gpsFixes?: LatLonTime[]
  argos?: LatLonTime[]
  navigatingToWaypoints?: LatLonTime[]
  reachedWaypoints?: LatLonTime[]
  emergencies?: LatLonTime[]
  latestWaypointPosition?: { lat: number; lon: number } | null
  waypoints?: { lat: number; lon: number }[]
  now: number
}): [number, number][] {
  const windowed = (points?: LatLonTime[]): [number, number][] =>
    recentPositionsWithinWindow(points, args.now).map((point) => [
      point.latitude,
      point.longitude,
    ])

  const waypointPts: [number, number][] = []
  if (args.latestWaypointPosition) {
    waypointPts.push([
      args.latestWaypointPosition.lat,
      args.latestWaypointPosition.lon,
    ])
  }
  for (const point of args.waypoints ?? []) {
    waypointPts.push([point.lat, point.lon])
  }

  return [
    ...windowed(args.gpsFixes),
    ...waypointPts,
    ...windowed(args.argos),
    ...windowed(args.navigatingToWaypoints),
    ...windowed(args.reachedWaypoints),
    ...windowed(args.emergencies),
  ]
}
