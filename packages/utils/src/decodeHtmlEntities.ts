/**
 * Decodes HTML entities in a string.
 * Supports both hexadecimal (&#x[hex];) and decimal (&#[dec];) entity formats.
 * @param text A string containing HTML entities to decode.
 * @returns The decoded string with HTML entities replaced by their character equivalents.
 */
export const decodeHtmlEntities = (text: string): string => {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
}
