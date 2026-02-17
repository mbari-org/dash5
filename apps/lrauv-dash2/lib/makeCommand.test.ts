import '@testing-library/jest-dom'
import { makeMissionCommand } from './makeCommand'

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
})
