import {
  missionNameFromStartedText,
  missionNameFromEventData,
} from '../lib/missionUtils'

describe('missionNameFromStartedText', () => {
  test('extracts name from standard mission-started text', () => {
    expect(missionNameFromStartedText('Started mission Default')).toBe(
      'Default'
    )
  })

  test('extracts multi-part mission name', () => {
    expect(
      missionNameFromStartedText('Started mission circle_acoustic_contact')
    ).toBe('circle_acoustic_contact')
  })

  test('is case-insensitive for the prefix', () => {
    expect(missionNameFromStartedText('started mission keepstation')).toBe(
      'keepstation'
    )
  })

  test('returns empty string for empty input', () => {
    expect(missionNameFromStartedText('')).toBe('')
  })

  test('trims surrounding whitespace from result', () => {
    expect(missionNameFromStartedText('Started mission  Default ')).toBe(
      'Default'
    )
  })
})

describe('missionNameFromEventData', () => {
  test('extracts bare mission name from a run command string with .tl', () => {
    expect(
      missionNameFromEventData(
        'load Science/circle_acoustic_contact.tl;set circle_acoustic_contact.MissionTimeout 1 h;run'
      )
    ).toBe('circle_acoustic_contact')
  })

  test('handles .xml extension', () => {
    expect(missionNameFromEventData('load Default.xml;run')).toBe('Default')
  })

  test('handles top-level path with no subdirectory', () => {
    expect(missionNameFromEventData('load keepstation.tl;run')).toBe(
      'keepstation'
    )
  })

  test('returns empty string when no mission file path is present', () => {
    expect(missionNameFromEventData('stop')).toBe('')
  })

  test('returns empty string for undefined input', () => {
    expect(missionNameFromEventData(undefined)).toBe('')
  })

  test('returns empty string for empty string input', () => {
    expect(missionNameFromEventData('')).toBe('')
  })
})
