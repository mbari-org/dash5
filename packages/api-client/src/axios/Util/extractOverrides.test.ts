import { extractOverrides } from './extractOverrides'

describe('extractOverrides', () => {
  const baseMissionData = `sched asap "load Science/sci2_noyo_optim.tl;set sci2_noyo_optim.MissionTimeout 13 h;set sci2_noyo_optim.NeedCommsTime 90 min;set sci2_noyo_optim.Depth1 250 m;set sci2_noyo_optim.Depth2 250 m;set sci2_noyo_optim.Depth3 NaN m" 33c01 1 4
sched asap "set sci2_noyo_optim.Repeat 12 count;set sci2_noyo_optim.Lat1 36.79279 degree;set sci2_noyo_optim.Lon1 -121.88919 degree;set sci2_noyo_optim.Lat2 36.78427 degree;set sci2_noyo_optim.Lon2 -121.91339 degree" 33c01 2 4
sched asap "set sci2_noyo_optim.ApproachDepth 10 m;set sci2_noyo_optim.ApproachSpeed 1.0 m/s;set sci2_noyo_optim.SlowSpeed 0.4 m/s;set sci2_noyo_optim.MinAltitude 10 m;set sci2_noyo_optim.MaxDepth 270 m" 33c01 3 4
sched asap "set sci2_noyo_optim:PowerOnly.SampleLoad1 1 bool;run" 33c01 4 4`

  it('should correctly parse waypoint and parameter overrides from mission data', () => {
    const result = extractOverrides(baseMissionData)

    // Check waypoint overrides (coordinates)
    expect(result.waypointOverrides).toEqual([
      { name: 'Lat1', value: '36.79279 degree' },
      { name: 'Lon1', value: '-121.88919 degree' },
      { name: 'Lat2', value: '36.78427 degree' },
      { name: 'Lon2', value: '-121.91339 degree' },
    ])

    // Check parameter overrides (depths, timeouts, and other parameters)
    expect(result.parameterOverrides).toEqual([
      { name: 'MissionTimeout', value: '13 h' },
      { name: 'NeedCommsTime', value: '90 min' },
      { name: 'Depth1', value: '250 m' },
      { name: 'Depth2', value: '250 m' },
      { name: 'Depth3', value: 'NaN m' },
      { name: 'Repeat', value: '12 count' },
      { name: 'ApproachDepth', value: '10 m' },
      { name: 'ApproachSpeed', value: '1.0 m/s' },
      { name: 'SlowSpeed', value: '0.4 m/s' },
      { name: 'MinAltitude', value: '10 m' },
      { name: 'MaxDepth', value: '270 m' },
      { name: 'PowerOnly.SampleLoad1', value: '1 bool' },
    ])
  })

  it('should handle empty input', () => {
    const result = extractOverrides('')
    expect(result.waypointOverrides).toHaveLength(0)
    expect(result.parameterOverrides).toHaveLength(0)
  })

  it('should handle input with no valid commands', () => {
    const missionData = 'invalid command; another invalid command'
    const result = extractOverrides(missionData)
    expect(result.waypointOverrides).toHaveLength(0)
    expect(result.parameterOverrides).toHaveLength(0)
  })

  it('should handle commands with both dot and colon separators', () => {
    const missionData = `${baseMissionData} set sci2_noyo_optim.Lat3 36.79279 degree; set sci2_noyo_optim:Param1 value1`
    const result = extractOverrides(missionData)

    // Check that original overrides are preserved
    expect(result.waypointOverrides.length).toBeGreaterThan(0)
    expect(result.parameterOverrides.length).toBeGreaterThan(0)

    // Check that new overrides are added
    expect(result.waypointOverrides).toContainEqual({
      name: 'Lat3',
      value: '36.79279 degree',
    })
    expect(result.parameterOverrides).toContainEqual({
      name: 'Param1',
      value: 'value1',
    })
  })

  it('should handle malformed commands in the input', () => {
    const missionData = `${baseMissionData} set h; set sci2_noyo_optim.Depth1 m; set set sci2_noyo_optim.Depth2 50 m`
    const result = extractOverrides(missionData)

    // Check that original overrides are preserved
    expect(result.waypointOverrides.length).toBeGreaterThan(0)
    expect(result.parameterOverrides.length).toBeGreaterThan(0)

    // Check that malformed commands don't break the parsing
    expect(result.parameterOverrides).toContainEqual({
      name: 'Depth1',
      value: 'm',
    })
    expect(result.parameterOverrides).toContainEqual({
      name: 'Depth2',
      value: '50 m',
    })
  })
})
