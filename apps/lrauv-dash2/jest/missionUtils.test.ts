import {
  missionNameFromStartedText,
  missionNameFromEventData,
  normalizeMissionName,
  normalizeMissionPath,
  missionPathFromEventData,
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

  test('extracts mission name from load command without extension', () => {
    expect(missionNameFromEventData('load Maintenance/calibration;run')).toBe(
      'calibration'
    )
  })

  test('extracts mission name from path with dashes and dots in filename', () => {
    expect(
      missionNameFromEventData('load Science/mbari-echo-5.25.tl;run')
    ).toBe('mbari-echo-5.25')
  })

  test('extracts mission name from directory with dashes', () => {
    expect(missionNameFromEventData('load Long-Range/default.tl;run')).toBe(
      'default'
    )
  })
})

describe('normalizeMissionName', () => {
  test('normalizes started-mission path names for matching', () => {
    expect(normalizeMissionName('Maintenance/calibration')).toBe('calibration')
  })

  test('normalizes extension and case', () => {
    expect(normalizeMissionName('Science/Default.TL')).toBe('default')
  })

  test('returns empty string for missing values', () => {
    expect(normalizeMissionName(undefined)).toBe('')
  })
})

describe('normalizeMissionPath', () => {
  test('normalizes path and removes extension', () => {
    expect(normalizeMissionPath('Science/Default.TL')).toBe('science/default')
  })

  test('returns empty string for missing values', () => {
    expect(normalizeMissionPath(undefined)).toBe('')
  })
})

describe('missionPathFromEventData', () => {
  test('extracts full mission path from load with extension', () => {
    expect(missionPathFromEventData('load Science/default.tl;run')).toBe(
      'science/default'
    )
  })

  test('extracts full path for mission with dashes and dots in filename', () => {
    expect(
      missionPathFromEventData('load Science/mbari-echo-5.25.tl;run')
    ).toBe('science/mbari-echo-5.25')
  })

  test('extracts full mission path from load without extension', () => {
    expect(missionPathFromEventData('load Maintenance/calibration;run')).toBe(
      'maintenance/calibration'
    )
  })

  test('returns empty string when no mission path is present', () => {
    expect(missionPathFromEventData('sched stop')).toBe('')
  })
})
