import { formatEventEntries } from './formatEventEntries'

describe('formatEventEntries', () => {
  const eventTypeNames = [
    'Ac Comms',
    'ArgoReceive',
    'Command Request',
    'Critical',
    'Data',
    'Deployment',
    'Direct Comms',
    'Emergency',
    'Fault',
    'GPS Fix',
    'Important',
    'Launch',
    'Log',
    'Mission Request',
    'Note',
    'Patch',
    'Recover',
    'Sat Comms',
    'Tracking',
  ]

  describe('single entry formatting', () => {
    it('formats a single entry as one line', () => {
      const selectedText =
        'Critical   14:30   2024-01-15   Some   log   message'
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe('Critical 14:30 2024-01-15 Some log message')
    })

    it('handles single entry with Today date', () => {
      const selectedText = 'Important   09:15   Today   Started   mission'
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe('Important 09:15 Today Started mission')
    })

    it('handles single entry with extra whitespace', () => {
      const selectedText =
        '   Data    10:45   2024-01-15     Processed   data   file   '
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe('Data 10:45 2024-01-15 Processed data file')
    })

    it('handles single entry with newlines', () => {
      const selectedText =
        'Note\n   12:00\n   2024-01-15\n   User\n   note\n   text'
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe('Note 12:00 2024-01-15 User note text')
    })
  })

  describe('multiple entries formatting', () => {
    it('formats multiple entries with each on its own line', () => {
      const selectedText = `
        Critical 14:30 2024-01-15 First log message
        Important 15:00 2024-01-15 Second log message
        Data 15:30 2024-01-15 Third log message
      `
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe(
        'Critical 14:30 2024-01-15 First log message\nImportant 15:00 2024-01-15 Second log message\nData 15:30 2024-01-15 Third log message'
      )
    })

    it('handles multiple entries with extra whitespace', () => {
      const selectedText = `
        Critical   14:30   2024-01-15   First   message
        Important   15:00   2024-01-15   Second   message
      `
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe(
        'Critical 14:30 2024-01-15 First message\nImportant 15:00 2024-01-15 Second message'
      )
    })

    it('handles multiple entries with mixed dates (Today and yyyy-MM-dd)', () => {
      const selectedText = `
        Critical 14:30 2024-01-15 First message
        Important 15:00 Today Second message
      `
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe(
        'Critical 14:30 2024-01-15 First message\nImportant 15:00 Today Second message'
      )
    })

    it('handles multiple entries with newlines between them', () => {
      const selectedText = `
        Critical 14:30 2024-01-15 First message
        
        Important 15:00 2024-01-15 Second message
        
        Data 15:30 2024-01-15 Third message
      `
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe(
        'Critical 14:30 2024-01-15 First message\nImportant 15:00 2024-01-15 Second message\nData 15:30 2024-01-15 Third message'
      )
    })

    it('handles event types with special characters', () => {
      const selectedText = `
        Ac Comms 14:30 2024-01-15 First message
        GPS Fix 15:00 2024-01-15 Second message
        Command Request 15:30 2024-01-15 Third message
      `
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe(
        'Ac Comms 14:30 2024-01-15 First message\nGPS Fix 15:00 2024-01-15 Second message\nCommand Request 15:30 2024-01-15 Third message'
      )
    })
  })

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      const result = formatEventEntries('', eventTypeNames)
      expect(result).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      const result = formatEventEntries('   \n\t   ', eventTypeNames)
      expect(result).toBe('')
    })

    it('handles text that does not match any event type pattern', () => {
      const selectedText = 'Some random text that does not match the pattern'
      const result = formatEventEntries(selectedText, eventTypeNames)
      // Should still format as single line
      expect(result).toBe('Some random text that does not match the pattern')
    })

    it('handles text with partial matches', () => {
      const selectedText =
        'Critical 14:30 2024-01-15 Message but no other matches'
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe(
        'Critical 14:30 2024-01-15 Message but no other matches'
      )
    })

    it('handles single-digit hours', () => {
      const selectedText = 'Critical 9:30 2024-01-15 Message'
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe('Critical 9:30 2024-01-15 Message')
    })

    it('handles two-digit hours', () => {
      const selectedText = 'Critical 14:30 2024-01-15 Message'
      const result = formatEventEntries(selectedText, eventTypeNames)
      expect(result).toBe('Critical 14:30 2024-01-15 Message')
    })
  })

  describe('regex escaping', () => {
    it('handles event type names with special regex characters', () => {
      const specialEventTypes = [
        'Test (Special)',
        'Test [Brackets]',
        'Test {Braces}',
      ]
      const selectedText = 'Test (Special) 14:30 2024-01-15 Message'
      const result = formatEventEntries(selectedText, specialEventTypes)
      expect(result).toBe('Test (Special) 14:30 2024-01-15 Message')
    })
  })
})
