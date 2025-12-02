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

  it('filters events before minTime to avoid previous missions', () => {
    const missionStartTime = 10000
    const oneMinuteBeforeMission = missionStartTime - 60000 // 4000
    const events = [
      // Event from previous mission (before 1 minute before mission start)
      makeEvent({
        unixTime: 3000,
        text: 'Got command .NeedCommsTime 15 min',
        eventId: 1,
      }),
      // Event from 1 minute before mission start (should be included)
      makeEvent({
        unixTime: 5000,
        text: 'Got command .NeedCommsTime 30 min',
        eventId: 2,
      }),
      // Event after mission start (should be included)
      makeEvent({
        unixTime: 12000,
        text: 'Got command .NeedCommsTime 45 min',
        eventId: 3,
      }),
    ]
    // Without minTime, it would select the most recent (45 min)
    const resultWithoutFilter = parseNeedCommsSelection(events)
    expect(resultWithoutFilter.minutes).toBe(45)
    expect(resultWithoutFilter.eventId).toBe(3)

    // With minTime, it should only consider events >= oneMinuteBeforeMission
    // So it should find the 30 min event (at 5000) or 45 min event (at 12000)
    // Since we scan newest first, it should find 45 min
    const resultWithFilter = parseNeedCommsSelection(
      events,
      oneMinuteBeforeMission
    )
    expect(resultWithFilter.minutes).toBe(45)
    expect(resultWithFilter.eventId).toBe(3)
    expect(resultWithFilter.eventUnixTime).toBe(12000)
  })

  it('excludes events before minTime even if they are the only matches', () => {
    const missionStartTime = 10000
    const oneMinuteBeforeMission = missionStartTime - 60000 // 4000
    const events = [
      // Only event from previous mission (before 1 minute before mission start)
      makeEvent({
        unixTime: 3000,
        text: 'Got command .NeedCommsTime 15 min',
        eventId: 1,
      }),
    ]
    // Without minTime, it would find the event
    const resultWithoutFilter = parseNeedCommsSelection(events)
    expect(resultWithoutFilter.minutes).toBe(15)

    // With minTime, it should not find any events (all are before minTime)
    const resultWithFilter = parseNeedCommsSelection(
      events,
      oneMinuteBeforeMission
    )
    expect(resultWithFilter.minutes).toBeNull()
    expect(resultWithFilter.eventId).toBeNull()
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
