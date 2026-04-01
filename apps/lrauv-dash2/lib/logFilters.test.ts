import {
  applySelectedFilters,
  deriveEventTypes,
  hasAllNonDataFiltersSelected,
  modalVisibleFilterIds,
} from './logFilters'
import { GetEventsResponse } from '@mbari/api-client'

describe('logFilters', () => {
  const modalIds = modalVisibleFilterIds()

  describe('deriveEventTypes', () => {
    test('returns undefined when no filters selected', () => {
      expect(deriveEventTypes([], false)).toBeUndefined()
      expect(deriveEventTypes([], true)).toBeUndefined()
    })

    test('returns undefined when all non-Data filters selected', () => {
      expect(deriveEventTypes(modalIds, false)).toBeUndefined()
      expect(deriveEventTypes(modalIds, true)).toBeUndefined()
    })

    test('returns union of event types for a subset', () => {
      const ids = ['Deployment', 'Note']
      const result = deriveEventTypes(ids, false)
      expect(result).toEqual(expect.arrayContaining(['deploy', 'note']))
      expect(result?.length).toBe(2)
    })

    test('appends dataProcessed when Include Data is on and not already covered', () => {
      const ids = ['Deployment']
      expect(deriveEventTypes(ids, true)).toEqual(['deploy', 'dataProcessed'])
    })
  })

  describe('applySelectedFilters', () => {
    const dataEvent = {
      eventType: 'dataProcessed',
    } as GetEventsResponse
    const deployEvent = { eventType: 'deploy' } as GetEventsResponse

    test('adds Data when Include Data is on and selection is partial', () => {
      const result = applySelectedFilters(
        [deployEvent, dataEvent],
        ['Deployment'],
        { includeDataEvents: true, allNonDataFiltersSelected: false }
      )
      expect(result).toEqual([deployEvent, dataEvent])
    })

    test('drops data when Include Data is off and selection is partial', () => {
      const result = applySelectedFilters(
        [deployEvent, dataEvent],
        ['Deployment'],
        { includeDataEvents: false, allNonDataFiltersSelected: false }
      )
      expect(result).toEqual([deployEvent])
    })

    test('when every non-Data filter is selected, skips narrowing by name but still drops data if Include Data is off', () => {
      const result = applySelectedFilters([deployEvent, dataEvent], modalIds, {
        includeDataEvents: false,
        allNonDataFiltersSelected: true,
      })
      expect(result).toEqual([deployEvent])
    })

    test('when every non-Data filter is selected and Include Data is on, keeps data events', () => {
      const result = applySelectedFilters([deployEvent, dataEvent], modalIds, {
        includeDataEvents: true,
        allNonDataFiltersSelected: true,
      })
      expect(result).toEqual([deployEvent, dataEvent])
    })
  })

  describe('hasAllNonDataFiltersSelected', () => {
    test('is true only when counts match modal-visible list', () => {
      expect(hasAllNonDataFiltersSelected(modalIds)).toBe(true)
      expect(hasAllNonDataFiltersSelected(['Deployment'])).toBe(false)
    })
  })
})
