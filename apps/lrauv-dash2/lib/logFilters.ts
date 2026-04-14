import { EventType, GetEventsResponse } from '@mbari/api-client'
import { applyEventFilters } from './eventFilterUtils'
import { eventFilters } from './formatEvent'

export const DATA_FILTER_ID = 'Data'

export type LogFilterId = keyof typeof eventFilters

const MODAL_VISIBLE_FILTER_IDS = Object.keys(eventFilters).filter(
  (id) => id !== DATA_FILTER_ID
)

/** Ids for filters shown in the modal (everything except Data, which uses the separate toggle). */
export const modalVisibleFilterIds = (): string[] => MODAL_VISIBLE_FILTER_IDS

/** Initial checkbox state: every modal-visible filter turned on. */
export const defaultModalSelections = (): Array<{ id: string; name: string }> =>
  MODAL_VISIBLE_FILTER_IDS.map((id) => ({ id, name: id }))

/** True when the user has every non-Data filter selected (same count as the modal list). */
export const hasAllNonDataFiltersSelected = (
  selectedFilterIds: string[]
): boolean => selectedFilterIds.length === MODAL_VISIBLE_FILTER_IDS.length

/** At least one modal filter checked, or Include Data Events is on. */
export const hasLogFilterSelection = (
  selectedFilterIds: string[],
  includeDataEvents: boolean
): boolean => selectedFilterIds.length > 0 || includeDataEvents

/**
 * Event types to request from the API: narrowed list when the user picks a subset of
 * filters; `undefined` means “all types.” Adds dataProcessed when Include Data is on.
 * When no modal filters are selected but Include Data is on, only `dataProcessed` is requested.
 */
export const deriveEventTypes = (
  selectedFilterIds: string[],
  includeDataEvents: boolean
): EventType[] | undefined => {
  if (!selectedFilterIds.length) {
    return includeDataEvents ? ['dataProcessed'] : undefined
  }
  if (hasAllNonDataFiltersSelected(selectedFilterIds)) {
    if (includeDataEvents) return undefined
    // All non-data filters selected but data excluded — return an explicit list so
    // the API does not also fetch dataProcessed (which undefined would cause).
    return selectedFilterIds
      .flatMap((id) => eventFilters[id as LogFilterId]?.eventTypes ?? [])
      .filter((k, i, a) => a.indexOf(k) === i) as EventType[]
  }
  const base = selectedFilterIds
    .flatMap((id) => eventFilters[id].eventTypes)
    .filter((k, i, a) => a.indexOf(k) === i)
  if (includeDataEvents && !base.includes('dataProcessed')) {
    return [...base, 'dataProcessed']
  }
  return base
}

const filterNamesForApply = (
  selectedFilterIds: string[],
  includeDataEvents: boolean
): string[] => {
  if (includeDataEvents && !selectedFilterIds.includes(DATA_FILTER_ID)) {
    return [...selectedFilterIds, DATA_FILTER_ID]
  }
  return [...selectedFilterIds]
}

/**
 * Keeps events that match the modal selection and Include Data toggle. When every
 * non-Data filter is selected, skips narrowing by filter name (same as “all types” fetch).
 */
export const applySelectedFilters = (
  events: GetEventsResponse[],
  selectedFilterIds: string[],
  options: {
    includeDataEvents: boolean
    allNonDataFiltersSelected: boolean
  }
): GetEventsResponse[] => {
  const { includeDataEvents, allNonDataFiltersSelected } = options
  let result = events
  if (!allNonDataFiltersSelected) {
    result = applyEventFilters(
      result,
      filterNamesForApply(selectedFilterIds, includeDataEvents)
    )
  }
  if (!includeDataEvents) {
    result = result.filter((e) => e.eventType !== 'dataProcessed')
  }
  return result
}
