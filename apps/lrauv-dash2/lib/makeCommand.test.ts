import '@testing-library/jest-dom'
import { makeMissionCommand } from './makeCommand'

describe('makeMissionCommand', () => {
  it('should return a command to load a mission', () => {
    const command = makeMissionCommand({
      mission: 'Science/profile_station.xml',
      parameterOverrides: [],
      scheduleMethod: 'ASAP',
    })
    expect(command).toBe('sched asap "load Science/profile_station.xml;run"')
  })

  it('should return a command to load a mission with parameters', () => {
    const command = makeMissionCommand({
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
    expect(command).toBe(
      'sched asap "load Science/profile_station.xml;set profile_station.param1 1 m;set profile_station.param2 2 m;run"'
    )
  })
  it('should return a command to load a mission with parameters and insert', () => {
    const command = makeMissionCommand({
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
    expect(command).toBe(
      'sched asap "load Science/profile_station.xml;set profile_station:insert1.param1 1 m;set profile_station:insert2.param2 2 m;run"'
    )
  })
})
