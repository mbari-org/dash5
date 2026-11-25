import '@testing-library/jest-dom'
import { makeCommand, makeMissionCommand } from './makeCommand'

describe('makeMissionCommand', () => {
  it('should return a command to load a mission', () => {
    const { commandText, schedDate, previewSbd } = makeMissionCommand({
      mission: 'Science/profile_station.xml',
      parameterOverrides: [],
      scheduleMethod: 'ASAP',
    })
    expect(previewSbd).toBe('sched asap "load Science/profile_station.xml;run"')
    expect(commandText).toBe('load Science/profile_station.xml;run')
    expect(schedDate).toBe('asap')
  })

  it('should return a command to load a mission with parameters', () => {
    const { commandText, previewSbd, schedDate } = makeMissionCommand({
      mission: 'Science/profile_station.xml',
      parameterOverrides: [
        {
          name: 'param1',
          overrideValue: '1',
          unit: 'm',
          value: '0',
        },
        {
          name: 'param2',
          overrideValue: '2',
          unit: 'm',
          value: '0',
        },
      ],
      scheduleMethod: 'ASAP',
    })
    expect(previewSbd).toBe(
      'sched asap "load Science/profile_station.xml;set profile_station.param1 1 m;set profile_station.param2 2 m;run"'
    )
    expect(commandText).toBe(
      'load Science/profile_station.xml;set profile_station.param1 1 m;set profile_station.param2 2 m;run'
    )
    expect(schedDate).toBe('asap')
  })

  // #796: filename stem ≠ script mission ID (e.g. tritoncam_expanding_donut.tl → expanding_donut)
  it('uses script missionId for set when it differs from the filename', () => {
    const { commandText } = makeMissionCommand({
      mission: 'Engineering/tritoncam_expanding_donut.tl',
      missionId: 'expanding_donut',
      parameterOverrides: [
        {
          name: 'Lat1',
          overrideValue: '36.8',
          unit: 'degree',
          value: 'NaN',
        },
      ],
      scheduleMethod: 'ASAP',
    })
    expect(commandText).toBe(
      'load Engineering/tritoncam_expanding_donut.tl;set expanding_donut.Lat1 36.8 degree;run'
    )
  })

  it('should return a command to load a mission with parameters and insert', () => {
    const { commandText, previewSbd, schedDate } = makeMissionCommand({
      mission: 'Science/profile_station.xml',
      parameterOverrides: [
        {
          name: 'param1',
          overrideValue: '1',
          unit: 'm',
          value: '0',
          insert: 'insert1',
        },
        {
          name: 'param2',
          overrideValue: '2',
          unit: 'm',
          value: '0',
          insert: 'insert2',
        },
      ],
      scheduleMethod: 'ASAP',
    })
    expect(previewSbd).toBe(
      'sched asap "load Science/profile_station.xml;set profile_station:insert1.param1 1 m;set profile_station:insert2.param2 2 m;run"'
    )
    expect(commandText).toBe(
      'load Science/profile_station.xml;set profile_station:insert1.param1 1 m;set profile_station:insert2.param2 2 m;run'
    )
    expect(schedDate).toBe('asap')
  })

  it('should convert local time to UTC in the correct format', () => {
    const { commandText, schedDate, previewSbd } = makeMissionCommand({
      mission: 'Science/test.xml',
      parameterOverrides: [],
      scheduleMethod: 'time',
      specifiedLocalTime: '2024-03-20T14:00:00-07:00', // Pacific time
    })

    // This time should be 21:00 UTC (14:00 PDT + 7 hours)
    expect(schedDate).toBe('20240320T2100')
    expect(previewSbd).toBe('sched 20240320T2100 "load Science/test.xml;run"')
    expect(commandText).toBe('load Science/test.xml;run')
  })

  it('wraps a dated command as sched repeat for the given number of days', () => {
    const { commandText, schedDate, schedRepeat, previewSbd } =
      makeMissionCommand({
        mission: 'Science/test.xml',
        parameterOverrides: [],
        scheduleMethod: 'time',
        specifiedLocalTime: '2024-03-20T14:00:00-07:00',
        schedRepeat: 3,
      })

    expect(schedDate).toBe('20240320T2100')
    expect(schedRepeat).toBe(3)
    expect(previewSbd).toBe(
      'sched repeat 3 20240320T2100 "load Science/test.xml;run"'
    )
    expect(commandText).toBe('load Science/test.xml;run')
  })

  it('ignores repeat unless the command is scheduled at a specific time', () => {
    const asap = makeMissionCommand({
      mission: 'Science/test.xml',
      parameterOverrides: [],
      scheduleMethod: 'ASAP',
      schedRepeat: 3,
    })
    expect(asap.schedRepeat).toBeUndefined()
    expect(asap.previewSbd).toBe('sched asap "load Science/test.xml;run"')

    const outOfRange = makeMissionCommand({
      mission: 'Science/test.xml',
      parameterOverrides: [],
      scheduleMethod: 'time',
      specifiedLocalTime: '2024-03-20T14:00:00-07:00',
      schedRepeat: 31,
    })
    expect(outOfRange.schedRepeat).toBeUndefined()
    expect(outOfRange.previewSbd).toBe(
      'sched 20240320T2100 "load Science/test.xml;run"'
    )
  })
})

describe('makeCommand', () => {
  it('passes schedRepeat through to the output for a timed command', () => {
    const { commandText, schedDate, schedRepeat, previewSbd } = makeCommand({
      commandText: 'failComponent',
      scheduleMethod: 'time',
      specifiedLocalTime: '2024-03-20T14:00:00-07:00',
      schedRepeat: 3,
    })

    expect(schedDate).toBe('20240320T2100')
    expect(schedRepeat).toBe(3)
    expect(previewSbd).toBe('sched repeat 3 20240320T2100 "failComponent"')
    expect(commandText).toBe('failComponent')
  })

  it('ignores schedRepeat for ASAP and end-of-schedule commands', () => {
    const asap = makeCommand({
      commandText: 'failComponent',
      scheduleMethod: 'ASAP',
      schedRepeat: 3,
    })
    expect(asap.schedRepeat).toBeUndefined()
    expect(asap.previewSbd).toBe('sched asap "failComponent"')

    const end = makeCommand({
      commandText: 'failComponent',
      scheduleMethod: 'end',
      schedRepeat: 3,
    })
    expect(end.schedRepeat).toBeUndefined()
  })
})
