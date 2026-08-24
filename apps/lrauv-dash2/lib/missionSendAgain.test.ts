import {
  previewTextFromEventData,
  innerCommandFromEventData,
  evaluateSendAgainGate,
  isEventScopedTempMission,
} from './missionSendAgain'

describe('innerCommandFromEventData', () => {
  it('returns undefined for empty input', () => {
    expect(innerCommandFromEventData(undefined)).toBeUndefined()
    expect(innerCommandFromEventData('')).toBeUndefined()
  })

  it('strips sched asap wrapper', () => {
    expect(
      innerCommandFromEventData('sched asap "load Science/sci2.tl;run"')
    ).toBe('load Science/sci2.tl;run')
  })

  it('strips sched with explicit date wrapper', () => {
    expect(
      innerCommandFromEventData(
        'sched 2026-08-24T10:00:00Z "load Science/sci2.tl;run"'
      )
    ).toBe('load Science/sci2.tl;run')
  })

  it('returns bare command unchanged', () => {
    expect(innerCommandFromEventData('load Science/sci2.tl;run')).toBe(
      'load Science/sci2.tl;run'
    )
  })
})

describe('previewTextFromEventData', () => {
  it('returns undefined for empty input', () => {
    expect(previewTextFromEventData(undefined)).toBeUndefined()
    expect(previewTextFromEventData('')).toBeUndefined()
  })

  it('keeps existing sched-wrapped payloads', () => {
    const text = 'sched asap "load Science/sci2.tl;run"'
    expect(previewTextFromEventData(text)).toBe(text)
  })

  it('wraps bare command text for Review preview', () => {
    expect(previewTextFromEventData('load Science/sci2.tl;run')).toBe(
      'sched asap "load Science/sci2.tl;run"'
    )
  })
})

describe('isEventScopedTempMission', () => {
  const eventData =
    'load Science/profile_station.tl;set profile_station.MissionTimeout 12 h;run'

  it('matches temp entries keyed by path with event description', () => {
    expect(
      isEventScopedTempMission(
        {
          id: 'Science/profile_station.tl',
          missionPath: 'Science/profile_station.tl',
          description: eventData,
        },
        'Science/profile_station.tl',
        eventData
      )
    ).toBe(true)
  })

  it('rejects same-path recent runs with a different description', () => {
    expect(
      isEventScopedTempMission(
        {
          id: 'run-other',
          missionPath: 'Science/profile_station.tl',
          description: 'load Science/profile_station.tl;run',
        },
        'Science/profile_station.tl',
        eventData
      )
    ).toBe(false)
  })
})

describe('evaluateSendAgainGate', () => {
  const readyBase = {
    sendAgain: true,
    listsLoading: false,
    missionPath: 'Science/sci2.tl',
    hasMatchingMission: true,
    selectedMission: 'Science/sci2.tl',
    hasAutoSelected: true,
    hasSelectedMissionData: true,
    scriptLoading: false,
    scriptError: false,
    eventData: 'load Science/sci2.tl;run',
    hasEventScopedTempSelected: true,
  }

  it('is not-applicable when sendAgain is false', () => {
    expect(evaluateSendAgainGate({ ...readyBase, sendAgain: false })).toEqual({
      action: 'not-applicable',
    })
  })

  it('waits while mission lists are loading', () => {
    expect(evaluateSendAgainGate({ ...readyBase, listsLoading: true })).toEqual(
      { action: 'wait' }
    )
  })

  it('aborts when lists settled but mission is missing', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasMatchingMission: false,
        hasAutoSelected: false,
        selectedMission: undefined,
        hasSelectedMissionData: false,
        hasEventScopedTempSelected: false,
      })
    ).toEqual({ action: 'abort', reason: 'no-match' })
  })

  it('aborts when mission path is missing', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        missionPath: null,
        hasMatchingMission: false,
      })
    ).toEqual({ action: 'abort', reason: 'no-match' })
  })

  it('waits until auto-select has chosen a mission', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasAutoSelected: false,
        selectedMission: undefined,
        hasSelectedMissionData: false,
        hasEventScopedTempSelected: false,
      })
    ).toEqual({ action: 'wait' })
  })

  it('waits until getScript data is available (override race)', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasSelectedMissionData: false,
        hasEventScopedTempSelected: false,
      })
    ).toEqual({ action: 'wait' })
  })

  it('waits until the event-scoped temp is selected', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasEventScopedTempSelected: false,
      })
    ).toEqual({ action: 'wait' })
  })

  it('does not require event temp when eventData is absent', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        eventData: undefined,
        hasEventScopedTempSelected: false,
      })
    ).toEqual({ action: 'ready' })
  })

  it('waits while getScript is still loading (prevents false abort on cached error)', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        scriptLoading: true,
        scriptError: false,
      })
    ).toEqual({ action: 'wait' })
  })

  it('aborts when getScript fails and no cached data is available', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasSelectedMissionData: false,
        scriptError: true,
        hasEventScopedTempSelected: false,
      })
    ).toEqual({ action: 'abort', reason: 'script-error' })
  })

  it('does not abort when getScript fails but cached data is already present', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasSelectedMissionData: true,
        scriptError: true,
      })
    ).toEqual({ action: 'ready' })
  })

  it('is ready when mission is selected and script data is loaded', () => {
    expect(evaluateSendAgainGate(readyBase)).toEqual({ action: 'ready' })
  })
})
