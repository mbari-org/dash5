import '@testing-library/jest-dom'
import {
  parseMissionNameSelection,
  parseNeedCommsSelection,
} from './parseNeedComms'

const makeEvent = (overrides: Partial<any> = {}): any => ({
  name: 'CommandExec',
  data: undefined,
  text: undefined,
  note: undefined,
  unixTime: undefined,
  eventId: undefined,
  ...overrides,
})

describe('parseNeedCommsSelection', () => {
  it('selects minutes from the most recent matching command event', () => {
    const events = [
      makeEvent({
        unixTime: 1000,
        text: 'Got command .NeedCommsTime 15 min',
        eventId: 1,
      }),
      makeEvent({
        unixTime: 2000,
        data: 'Got command .NeedCommsTime 45 minutes',
        eventId: 2,
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBe(45)
    expect(result.eventUnixTime).toBe(2000)
    expect(result.eventId).toBe(2)
    expect(result.eventText).toContain('NeedCommsTime')
  })

  it('respects priority: prefers NeedCommsTime over NeedCommsTimeVeryLong', () => {
    const events = [
      makeEvent({
        unixTime: 3000,
        text: 'Got command .NeedCommsTime 30 min .NeedCommsTimeVeryLong 1 hour',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBe(30)
  })

  it('parses hours when using NeedCommsTimeVeryLong without explicit unit', () => {
    const events = [
      makeEvent({
        unixTime: 4000,
        note: 'Got command .NeedCommsTimeVeryLong 1',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBe(60)
  })

  it('parses fractional hours correctly', () => {
    const events = [
      makeEvent({
        unixTime: 5000,
        text: 'Got command .NeedCommsTime 1.5 hours',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBe(90)
  })

  it('supports alternate key variants like NeedCommsTimeTransit', () => {
    const events = [
      makeEvent({
        unixTime: 6000,
        data: 'Got command .NeedCommsTimeTransit 15 min',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBe(15)
  })

  it('ignores scheduler-related lines', () => {
    const events = [
      makeEvent({
        unixTime: 7000,
        text: 'Got command .NeedCommsTime 30 min schedule asap',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBeNull()
  })

  it('ignores events that are not CommandExec/CommandLine', () => {
    const events = [
      makeEvent({
        name: 'OtherEvent',
        unixTime: 8000,
        text: 'Got command .NeedCommsTime 25 min',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBeNull()
  })

  it('skips zero or negative values', () => {
    const events = [
      makeEvent({
        unixTime: 9000,
        text: 'Got command .NeedCommsTime 0 minutes',
      }),
      makeEvent({
        unixTime: 10000,
        note: 'Got command .NeedCommsTime -5 min',
      }),
    ]
    const result = parseNeedCommsSelection(events)
    expect(result.minutes).toBeNull()
    expect(result.eventUnixTime).toBeNull()
  })
})

describe('parseMissionNameSelection', () => {
  it('extracts mission name from the most recent event text/data/note', () => {
    const events = [
      makeEvent({
        unixTime: 1000,
        text: 'Started mission SCIENCE_MISSION',
      }),
      makeEvent({
        unixTime: 2000,
        data: 'Some other content',
      }),
      makeEvent({
        unixTime: 3000,
        note: 'Started mission NEW_MISSION_2',
      }),
    ]
    const result = parseMissionNameSelection(events)
    expect(result.missionName).toBe('NEW_MISSION_2')
    expect(result.eventUnixTime).toBe(3000)
    expect(result.eventText).toContain('Started mission')
  })

  it('returns nulls when no mission name is present', () => {
    const events = [
      makeEvent({ unixTime: 1000, text: 'No mission here' }),
      makeEvent({ unixTime: 2000, data: 'Random text' }),
    ]
    const result = parseMissionNameSelection(events)
    expect(result.missionName).toBeNull()
    expect(result.eventUnixTime).toBeNull()
    expect(result.eventText).toBeNull()
  })
})
