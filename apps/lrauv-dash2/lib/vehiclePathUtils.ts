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
