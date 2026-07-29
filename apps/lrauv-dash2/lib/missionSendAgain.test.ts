import { previewTextFromEventData } from './missionSendAgain'

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
