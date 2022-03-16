import { decamelize } from 'humps'

/**
 * Capitalizes the first charactaer of a string.
 * @param s The string to capitalize.
 */
export const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/**
 * Converts a snake cased string into an appended list of capitalized words.
 * @param s The string to capitalize.
 */
export const capitalizeSnakeCase = (s: string) =>
  s.split('_').map(capitalize).join(' ')

/**
 * A utility method to make a programattic string human readable.
 * @param str The string to format.
 */
export const humanize = (str: string, camelized?: boolean) =>
  capitalizeSnakeCase(camelized ? decamelize(str) : str)
