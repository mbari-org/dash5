/**
 * Extracts the mission script path from a written command string.
 * Prefer the path after `load` or `run` so we do not capture those keywords.
 * Falls back to the first path-like token ending in `.xml` or `.tl`.
 *
 * The character class intentionally includes dashes, dots, and percent-encoded
 * characters so paths like `Long-Range/Default.xml` and `mbari-echo-5.25.tl`
 * are matched correctly.
 */
export const parseMissionPathFromCommand = (
  writtenCommand: string
): string | undefined => {
  const normalized = writtenCommand.replace(/%20/g, ' ')
  const missionPathPattern = /[A-Za-z0-9_./%\- ]+\.(?:xml|tl)/i
  const afterKeyword = normalized
    .match(
      new RegExp(`(?:load|run)\\s+(${missionPathPattern.source})`, 'i')
    )?.[1]
    ?.trim()
  if (afterKeyword) return afterKeyword
  return normalized.match(missionPathPattern)?.[0]?.trim()
}
