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

/** True when a list entry is the event-scoped temp from useInsertTempMission. */
export const isEventScopedTempMission = (
  mission: {
    id: string
    missionPath?: string
    description?: string
  },
  missionPath: string,
  eventData: string
): boolean =>
  (mission.id === missionPath || mission.missionPath === missionPath) &&
  mission.description === eventData

export type SendAgainGateResult =
  | { action: 'not-applicable' }
  | { action: 'wait' }
  | { action: 'ready' }
  | { action: 'abort'; reason: 'no-match' | 'script-error' }

/**
 * Decide when Send again may mount the wizard on Send Command.
 * Must wait for getScript and (when eventData is present) the event-scoped
 * temp mission so defaultOverrides match the Review preview — not a different
 * recent run that shares the same path.
 */
export const evaluateSendAgainGate = (input: {
  sendAgain: boolean
  listsLoading: boolean
  missionPath?: string | null
  hasMatchingMission: boolean
  selectedMission?: string
  hasAutoSelected: boolean
  hasSelectedMissionData: boolean
  scriptLoading: boolean
  scriptError: boolean
  eventData?: string | null
  hasEventScopedTempSelected: boolean
}): SendAgainGateResult => {
  if (!input.sendAgain) return { action: 'not-applicable' }
  if (input.listsLoading) return { action: 'wait' }
  if (!input.missionPath || !input.hasMatchingMission) {
    return { action: 'abort', reason: 'no-match' }
  }
  // Bootstrap selection may already be fetching getScript before the event temp
  // locks hasAutoSelected — still abort if that script request fails.
  if (input.scriptLoading) return { action: 'wait' }
  if (input.scriptError && input.selectedMission) {
    return { action: 'abort', reason: 'script-error' }
  }
  if (!input.hasAutoSelected || !input.selectedMission) {
    return { action: 'wait' }
  }
  if (!input.hasSelectedMissionData) {
    return { action: 'wait' }
  }
  if (input.eventData?.trim() && !input.hasEventScopedTempSelected) {
    return { action: 'wait' }
  }
  return { action: 'ready' }
}
