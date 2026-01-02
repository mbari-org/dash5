/**
 * Formats selected text containing log entries for copying.
 *
 * Formats selected text so that:
 * - Single entries are formatted as one line (removes extra whitespace)
 * - Multiple entries are formatted with each entry on its own line
 *
 * @param selectedText - The text that was selected by the user
 * @param eventTypeNames - Array of event type names to match against (e.g., ['Ac Comms', 'Critical', 'Data'])
 * @returns The formatted text ready for copying
 */
export const formatEventEntries = (
  selectedText: string,
  eventTypeNames: string[]
): string => {
  const trimmedText = selectedText.trim()
  if (!trimmedText) return ''

  // Pattern to match: EventType followed by time (H:mm) and date (yyyy-MM-dd or Today)
  // This regex finds the start of each log entry
  const entryStartPattern = new RegExp(
    `\\b(${eventTypeNames
      .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})\\s+(\\d{1,2}:\\d{2})\\s+(\\d{4}-\\d{2}-\\d{2}|Today)`,
    'gi'
  )

  // Find all entry start positions
  const entryStarts: number[] = []
  let match
  while ((match = entryStartPattern.exec(trimmedText)) !== null) {
    entryStarts.push(match.index)
  }

  if (entryStarts.length > 1) {
    // Multiple entries detected - split and format each as a single line
    const entries: string[] = []
    for (let i = 0; i < entryStarts.length; i++) {
      const start = entryStarts[i]
      const end = entryStarts[i + 1] || trimmedText.length
      const entryText = trimmedText.substring(start, end).trim()
      // Format entry as single line (remove extra whitespace)
      const formattedEntry = entryText
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .join(' ')
      entries.push(formattedEntry)
    }
    return entries.join('\n')
  } else {
    // Single entry - format as single line
    return trimmedText
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .join(' ')
  }
}
