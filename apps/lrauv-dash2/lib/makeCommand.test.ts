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
})
