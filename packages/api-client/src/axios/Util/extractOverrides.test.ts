import { extractOverrides } from './extractOverrides'

describe('extractOverrides', () => {
  const baseMissionData = `sched asap "load Science/sci2_noyo_optim.tl;set sci2_noyo_optim.MissionTimeout 13 h;set sci2_noyo_optim.NeedCommsTime 90 min;set sci2_noyo_optim.Depth1 250 m;set sci2_noyo_optim.Depth2 250 m;set sci2_noyo_optim.Depth3 NaN m" 33c01 1 4
sched asap "set sci2_noyo_optim.Repeat 12 count;set sci2_noyo_optim.Lat1 36.79279 degree;set sci2_noyo_optim.Lon1 -121.88919 degree;set sci2_noyo_optim.Lat2 36.78427 degree;set sci2_noyo_optim.Lon2 NaN degree" 33c01 2 4
sched asap "set sci2_noyo_optim.ApproachDepth 10 m;set sci2_noyo_optim.ApproachSpeed 1.0 m/s;set sci2_noyo_optim.SlowSpeed 0.4 m/s;set sci2_noyo_optim.MinAltitude 10 m;set sci2_noyo_optim.MaxDepth 270 m" 33c01 3 4
sched asap "set sci2_noyo_optim:PowerOnly.SampleLoad1 1 bool;run" 33c01 4 4`

  it('should correctly parse waypoint and parameter overrides from mission data', async () => {
    const result = await extractOverrides(baseMissionData)

    // Check waypoint overrides (coordinates)
    expect(result.waypointOverrides).toEqual([
      { name: 'Lat1', value: '36.79279', insert: undefined, unit: 'degree' },
      { name: 'Lon1', value: '-121.88919', insert: undefined, unit: 'degree' },
      { name: 'Lat2', value: '36.78427', insert: undefined, unit: 'degree' },
      { name: 'Lon2', value: 'NaN', insert: undefined, unit: 'degree' },
    ])

    // Check parameter overrides (depths, timeouts, and other parameters)
    expect(result.parameterOverrides).toEqual([
      { name: 'MissionTimeout', value: '13', insert: undefined, unit: 'h' },
      { name: 'NeedCommsTime', value: '90', insert: undefined, unit: 'min' },
      { name: 'Depth1', value: '250', insert: undefined, unit: 'm' },
      { name: 'Depth2', value: '250', insert: undefined, unit: 'm' },
      { name: 'Depth3', value: 'NaN', insert: undefined, unit: 'm' },
      { name: 'Repeat', value: '12', insert: undefined, unit: 'count' },
      { name: 'ApproachDepth', value: '10', insert: undefined, unit: 'm' },
      { name: 'ApproachSpeed', value: '1.0', insert: undefined, unit: 'm/s' },
      { name: 'SlowSpeed', value: '0.4', insert: undefined, unit: 'm/s' },
      { name: 'MinAltitude', value: '10', insert: undefined, unit: 'm' },
      { name: 'MaxDepth', value: '270', insert: undefined, unit: 'm' },
      { name: 'SampleLoad1', value: '1', insert: 'PowerOnly', unit: 'bool' },
    ])
  })

  it('should handle empty input', async () => {
    const result = await extractOverrides('')
    expect(result.waypointOverrides).toHaveLength(0)
    expect(result.parameterOverrides).toHaveLength(0)
  })

  it('should handle input with no valid commands', async () => {
    const missionData = 'invalid command; another invalid command'
    const result = await extractOverrides(missionData)
    expect(result.waypointOverrides).toHaveLength(0)
    expect(result.parameterOverrides).toHaveLength(0)
  })

  it('should handle commands with both dot and colon separators', async () => {
    const missionData = `${baseMissionData} set sci2_noyo_optim.Lat3 36.79279 degree; set sci2_noyo_optim:Param1 value1`
    const result = await extractOverrides(missionData)

    // Check that original overrides are preserved
    expect(result.waypointOverrides.length).toBeGreaterThan(0)
    expect(result.parameterOverrides.length).toBeGreaterThan(0)

    // Check that new overrides are added
    expect(result.waypointOverrides).not.toContainEqual(
      expect.objectContaining({ name: 'Lat3' })
    )

    expect(result.parameterOverrides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Lat3',
          value: '36.79279',
          unit: 'degree',
        }),
        expect.objectContaining({
          name: 'Param1',
          value: 'value1',
          unit: undefined,
        }),
      ])
    )
  })

  it('should handle malformed commands in the input', async () => {
    const missionData = `${baseMissionData} set h; set sci2_noyo_optim.Depth1 m; set set sci2_noyo_optim.Depth2 50 m`
    const result = await extractOverrides(missionData)

    // Check that original overrides are preserved
    expect(result.waypointOverrides.length).toBeGreaterThan(0)
    expect(result.parameterOverrides.length).toBeGreaterThan(0)

    // Check that malformed commands don't break the parsing
    expect(result.parameterOverrides).toContainEqual({
      name: 'Depth1',
      value: 'm',
      unit: undefined,
    })
    expect(result.parameterOverrides).toContainEqual({
      name: 'Depth2',
      value: '50',
      unit: 'm',
    })
  })

  it('should classify non-standard lat/lon names as waypoints when script metadata provides the pairs', async () => {
    // Arrange – provide mission data with TransitLatitude / TransitLongitude
    const missionData =
      'load Science/transit.tl; set transit.TransitLatitude 36.9 degree; set transit.TransitLongitude -122.1 degree; run'

    const latLonNamePairs = [
      { latName: 'TransitLatitude', lonName: 'TransitLongitude' },
    ]

    const result = extractOverrides(missionData, latLonNamePairs)

    // Assert – both names should be treated as waypoint overrides
    expect(result.waypointOverrides).toContainEqual({
      name: 'TransitLatitude',
      value: '36.9',
      unit: 'degree',
    })
    expect(result.waypointOverrides).toContainEqual({
      name: 'TransitLongitude',
      value: '-122.1',
      unit: 'degree',
    })
    expect(result.parameterOverrides).not.toContainEqual(
      expect.objectContaining({ name: 'TransitLatitude' })
    )
  })

  it('should capture insert for prefixed parameter names', async () => {
    const missionData = 'set sci2_noyo_optim:PowerOnly.SampleLoad1 1 bool'
    const result = extractOverrides(missionData)

    expect(result.parameterOverrides).toContainEqual({
      name: 'SampleLoad1',
      value: '1',
      insert: 'PowerOnly',
      unit: 'bool',
    })
  })
})
