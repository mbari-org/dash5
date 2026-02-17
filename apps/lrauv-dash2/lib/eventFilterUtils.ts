/**
 * Generic helper utilities for client-side event filtering based on the
 * `eventFilters` map exported from `formatEvent.ts`.
 *
 * Each entry in `eventFilters` contains:
 *   • `eventTypes` – EventType[] that belong to that category
 *   • `filter?`    – optional filtering for comms events
 *
 * The functions below combine both rules so that a consumer can simply supply
 * the chosen filter names (as selected in the UI) and receive the subset of
 * events that satisfy *any* of those filters.
 */

import { GetEventsResponse } from '@mbari/api-client'
import { eventFilters } from './formatEvent'

/**
 * Returns true when the provided event satisfies the filter referenced by
 * `filterName`.
 */
export function doesEventMatchFilter(
  event: GetEventsResponse,
  selectedEventType: string
): boolean {
  const matchingEventFilter = eventFilters[selectedEventType]
  if (!matchingEventFilter) return false

  // 1) Must match the allowed eventTypes for that filter.
  if (!matchingEventFilter.eventTypes.includes(event.eventType)) return false

  // 2) If it's a comms event, it must also pass the additional comms filters
  return matchingEventFilter.filter ? matchingEventFilter.filter(event) : true
}

/**
 * Filters `events`, keeping only those that satisfy at least one of the filter
 * names in `selectedFilterNames`.
 *
 * If no filter names are provided, the original `events` array is returned
 * unchanged.
 */
export function applyEventFilters(
  events: GetEventsResponse[],
  selectedEventTypes: string[]
): GetEventsResponse[] {
  if (!selectedEventTypes.length) return events

  return events.filter((event) =>
    selectedEventTypes.some((name) => doesEventMatchFilter(event, name))
  )
}
