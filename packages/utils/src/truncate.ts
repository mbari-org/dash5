/**
 * A utility method to truncate a string at maximum length.
 * @param str The initial string to truncate.
 * @param length The maximum allowed length.
 * @param ending A string to terminate the truncated value with (defaults to '...')
 * @param tail A minimum amount of text to retain on the tail end of the string.
 */
export const truncate = (
  str: string,
  length: number = 100,
  separator: string = "...",
  tail?: number
) => {
  if (length === null) {
    return str
  }
  let tailContent = ""
  if (tail) {
    tailContent = tail ? str.substring(str.length - tail, str.length) : ""
  }
  if (str.length > length) {
    return (
      str.substring(0, length - separator.length - tailContent.length) +
      separator +
      tailContent
    )
  } else {
    return str
  }
}
