/**
 * Extracts the mission script path from a written command string.
 * Prefer the path after `load` or `run` so we do not capture those keywords.
 * Falls back to the first path-like token ending in `.xml` or `.tl`.
 */
export const parseMissionPathFromCommand = (
  writtenCommand: string
): string | undefined => {
  const normalized = writtenCommand.replace(/%20/g, ' ')
  const afterKeyword = normalized
    .match(/(?:load|run)\s+([A-Za-z0-9_/ ]+\.(?:xml|tl))/i)?.[1]
    ?.trim()
  if (afterKeyword) return afterKeyword
  return normalized.match(/[A-Za-z0-9_/]+\.(?:xml|tl)/)?.[0]
}
