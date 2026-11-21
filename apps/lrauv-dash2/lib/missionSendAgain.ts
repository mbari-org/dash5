/**
 * Build Confirm & Send preview text from a prior Schedule event payload (#799).
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

/**
 * Return the raw inner command from event data, stripping any `sched … "…"`
 * wrapper (including optional trailing SBD part tokens, e.g. `tok 1 3`, and
 * multi-line chunked payloads where each line carries the same inner command).
 * This is what createCommand's commandText param expects — the backend
 * handles scheduling separately via schedDate.
 */
export const innerCommandFromEventData = (
  eventData?: string | null
): string | undefined => {
  if (!eventData?.trim()) return undefined
  // For multi-line SBD payloads all lines carry the same inner command —
  // operate on the first non-empty line only.
  const firstLine = eventData
    .trim()
    .split(/\r?\n/)
    .find((l) => l.trim())
    ?.trim()
  if (!firstLine) return undefined
  // Match zero or more scheduling tokens before the quoted payload so bare
  // forms like `sched "restart logs"` and multi-token forms like
  // `sched 20260824T1000 repeat 2 "..."` are handled alongside `sched asap "..."`.
  const match = firstLine.match(
    /^sched\s+(?:[^"\s]+\s+)*"([\s\S]+?)"(?:\s.*)?$/i
  )
  if (match) return match[1]
  // Unquoted legacy form: sched asap|<timestamp> inner command
  const unquotedMatch = firstLine.match(
    /^sched\s+(?:asap|\d{4,8}T\d{4,6})\s+([\s\S]+)$/i
  )
  return unquotedMatch
    ? unquotedMatch[1].replace(/\s+tok\s+\d+\s+\d+\s*$/i, '').trim()
    : firstLine
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
 * Decide when Send again may mount the wizard on Confirm & Send.
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
  // locks hasAutoSelected — still abort if that script request fails, but only
  // when there is no cached script data already available to proceed with.
  if (input.scriptLoading) return { action: 'wait' }
  if (
    input.scriptError &&
    input.selectedMission &&
    !input.hasSelectedMissionData
  ) {
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
