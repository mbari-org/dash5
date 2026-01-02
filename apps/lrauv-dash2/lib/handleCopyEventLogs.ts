import React from 'react'
import { formatEventEntries } from '@mbari/utils'
import { eventFilters } from './formatEvent'

const eventTypeNames = Object.keys(eventFilters)

/**
 * Copy handler for log entries.
 * Formats selected text so that:
 * - Single entries are formatted as one line
 * - Multiple entries are formatted with each entry on its own line
 *
 * @param e - The clipboard event
 */
export const handleCopyEventLogs = (e: React.ClipboardEvent<HTMLElement>) => {
  const selection = window.getSelection()
  const selectedText = selection?.toString()
  if (!selectedText) return

  const formattedText = formatEventEntries(selectedText, eventTypeNames)
  if (!formattedText) return

  e.clipboardData.setData('text/plain', formattedText)
  e.preventDefault()
}
