/**
 * Shortens a full name by keeping the first name intact and reducing other names to initials.
 * @param name - The full name to be shortened
 * @returns A shortened version of the name with appropriate spacing and punctuation
 *
 * @example
 * ```
 * shortenName("John Smith") // returns "John S."
 * shortenName("Mary Jane Watson") // returns "Mary J. W."
 * ```
 */

export const shortenName = (name: string) =>
  name
    .split(' ')
    .reduce((acc, curr, idx) => `${acc} ${idx > 0 ? curr[0] + '.' : curr}`, '')
    .trim()
