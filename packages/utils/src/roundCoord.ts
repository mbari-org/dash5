/**
 * Rounds a coordinate (lat/lng) to a fixed number of decimal places.
 * Used for waypoints and map positions so stored values have consistent precision.
 *
 * @param n - Coordinate value (latitude or longitude)
 * @param decimals - Number of decimal places (default 5, ~1.1 m precision)
 * @returns Rounded number
 */
export function roundCoord(n: number, decimals = 5): number {
  return parseFloat(n.toFixed(decimals))
}
