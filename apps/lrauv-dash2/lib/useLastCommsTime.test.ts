import { isSatCommsEvent, isCellCommsEvent } from './useLastCommsTime'

const makeEvent = (eventType: string, state?: number) => ({ eventType, state })

describe('isSatCommsEvent', () => {
  it('returns true for sbdReceive with state 0 (satellite)', () => {
    expect(isSatCommsEvent(makeEvent('sbdReceive', 0))).toBe(true)
  })

  it('returns false for sbdReceive with state 2 (cell)', () => {
    expect(isSatCommsEvent(makeEvent('sbdReceive', 2))).toBe(false)
  })

  it('returns false for a different event type even if state is 0', () => {
    expect(isSatCommsEvent(makeEvent('missionStarted', 0))).toBe(false)
  })

  it('returns false when state is undefined', () => {
    expect(isSatCommsEvent(makeEvent('sbdReceive', undefined))).toBe(false)
  })

  it('returns false for sbdReceive with any state other than 0', () => {
    expect(isSatCommsEvent(makeEvent('sbdReceive', 1))).toBe(false)
  })
})

describe('isCellCommsEvent', () => {
  it('returns true for sbdReceive with state 2 (cell)', () => {
    expect(isCellCommsEvent(makeEvent('sbdReceive', 2))).toBe(true)
  })

  it('returns false for sbdReceive with state 0 (satellite)', () => {
    expect(isCellCommsEvent(makeEvent('sbdReceive', 0))).toBe(false)
  })

  it('returns false for a different event type even if state is 2', () => {
    expect(isCellCommsEvent(makeEvent('missionStarted', 2))).toBe(false)
  })

  it('returns false when state is undefined', () => {
    expect(isCellCommsEvent(makeEvent('sbdReceive', undefined))).toBe(false)
  })

  it('returns false for sbdReceive with any state other than 2', () => {
    expect(isCellCommsEvent(makeEvent('sbdReceive', 1))).toBe(false)
  })
})
