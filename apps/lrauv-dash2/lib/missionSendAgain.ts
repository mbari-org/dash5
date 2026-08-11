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

export type SendAgainGateResult =
  | { action: 'not-applicable' }
  | { action: 'wait' }
  | { action: 'ready' }
  | { action: 'abort'; reason: 'no-match' | 'script-error' }

/**
 * Decide when Send again may mount the wizard on Send Command.
 * Must wait for getScript (`hasSelectedMissionData`) so defaultOverrides /
 * useInsertTempMission can derive prior-run params before confirm — otherwise
 * Review can show eventData while Send rebuilds from template defaults.
 */
export const evaluateSendAgainGate = (input: {
  sendAgain: boolean
  listsLoading: boolean
  missionPath?: string | null
  hasMatchingMission: boolean
  selectedMission?: string
  hasAutoSelected: boolean
  hasSelectedMissionData: boolean
  scriptError: boolean
}): SendAgainGateResult => {
  if (!input.sendAgain) return { action: 'not-applicable' }
  if (input.listsLoading) return { action: 'wait' }
  if (!input.missionPath || !input.hasMatchingMission) {
    return { action: 'abort', reason: 'no-match' }
  }
  if (!input.hasAutoSelected || !input.selectedMission) {
    return { action: 'wait' }
  }
  if (input.scriptError) {
    return { action: 'abort', reason: 'script-error' }
  }
  if (!input.hasSelectedMissionData) {
    return { action: 'wait' }
  }
  return { action: 'ready' }
}
