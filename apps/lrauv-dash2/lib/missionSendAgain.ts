/**
 * Build Review & Send preview text from a prior Schedule event payload (#799).
 * Event data may already be wrapped in `sched … "…"`.
 */
export const previewTextFromEventData = (
  eventData?: string | null
): string | undefined => {
  if (!eventData?.trim()) return undefined
  const trimmed = eventData.trim()
  if (/^sched\s+/i.test(trimmed)) return trimmed
  return `sched asap "${trimmed}"`
}
