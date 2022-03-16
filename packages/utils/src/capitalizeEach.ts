/**
 * Capitalizes each individual word in a string.
 * @param text A string to format.
 */
export const capitalizeEach = (text: string) =>
  text
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
