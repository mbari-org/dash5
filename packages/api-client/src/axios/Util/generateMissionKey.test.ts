import { generateMissionKey } from './generateMissionKey'
import type { MissionRun } from './generateMissionKey'

describe('generateMissionKey', () => {
  it('should generate the same key for identical mission runs', () => {
    const missionRun: MissionRun = {
      missionName: 'test_mission',
      waypointOverrides: [
        { name: 'wp1', value: '10' },
        { name: 'wp2', value: '20' },
      ],
      parameterOverrides: [
        { name: 'speed', value: '2' },
        { name: 'depth', value: '100' },
      ],
    }

    const key1 = generateMissionKey(missionRun)
    const key2 = generateMissionKey(missionRun)

    expect(key1).toBe(key2)
  })

  it('should generate different keys for different mission names', () => {
    const run1: MissionRun = {
      missionName: 'mission1',
      waypointOverrides: [],
      parameterOverrides: [],
    }

    const run2: MissionRun = {
      missionName: 'mission2',
      waypointOverrides: [],
      parameterOverrides: [],
    }

    const key1 = generateMissionKey(run1)
    const key2 = generateMissionKey(run2)

    expect(key1).not.toBe(key2)
  })

  it('should generate the same key regardless of override order', () => {
    const run1: MissionRun = {
      missionName: 'test_mission',
      waypointOverrides: [
        { name: 'wp1', value: '10' },
        { name: 'wp2', value: '20' },
      ],
      parameterOverrides: [{ name: 'speed', value: '2' }],
    }

    const run2: MissionRun = {
      missionName: 'test_mission',
      waypointOverrides: [
        { name: 'wp2', value: '20' },
        { name: 'wp1', value: '10' },
      ],
      parameterOverrides: [{ name: 'speed', value: '2' }],
    }

    const key1 = generateMissionKey(run1)
    const key2 = generateMissionKey(run2)

    expect(key1).toBe(key2)
  })

  it('should handle empty overrides', () => {
    const run: MissionRun = {
      missionName: 'test_mission',
      waypointOverrides: [],
      parameterOverrides: [],
    }

    const key = generateMissionKey(run)
    expect(key).toBe('test_mission||')
  })

  it('should generate different keys for different override values', () => {
    const run1: MissionRun = {
      missionName: 'test_mission',
      waypointOverrides: [{ name: 'wp1', value: '10' }],
      parameterOverrides: [],
    }

    const run2: MissionRun = {
      missionName: 'test_mission',
      waypointOverrides: [{ name: 'wp1', value: '20' }],
      parameterOverrides: [],
    }

    const key1 = generateMissionKey(run1)
    const key2 = generateMissionKey(run2)

    expect(key1).not.toBe(key2)
  })
})
