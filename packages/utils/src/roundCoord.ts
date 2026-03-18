/**
 * Rounds a coordinate (lat/lng) to limit the number of decimal places to a maximum amount.
 *
 * @param n - Coordinate value (latitude or longitude)
 * @param decimals - Max number of decimal places (default 5, ~1.1 m precision)
 * @returns Rounded number
 */
export function roundCoord(n: number, decimals = 5): number {
  return parseFloat(n.toFixed(decimals))
}
