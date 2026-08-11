import {
  previewTextFromEventData,
  evaluateSendAgainGate,
} from './missionSendAgain'

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

describe('evaluateSendAgainGate', () => {
  const readyBase = {
    sendAgain: true,
    listsLoading: false,
    missionPath: 'Science/sci2.tl',
    hasMatchingMission: true,
    selectedMission: 'Science/sci2.tl',
    hasAutoSelected: true,
    hasSelectedMissionData: true,
    scriptError: false,
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
      })
    ).toEqual({ action: 'wait' })
  })

  it('waits until getScript data is available (override race)', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasSelectedMissionData: false,
      })
    ).toEqual({ action: 'wait' })
  })

  it('aborts when getScript fails', () => {
    expect(
      evaluateSendAgainGate({
        ...readyBase,
        hasSelectedMissionData: false,
        scriptError: true,
      })
    ).toEqual({ action: 'abort', reason: 'script-error' })
  })

  it('is ready when mission is selected and script data is loaded', () => {
    expect(evaluateSendAgainGate(readyBase)).toEqual({ action: 'ready' })
  })
})
