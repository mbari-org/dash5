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
      { name: 'Lat1', value: '36.79279' },
      { name: 'Lon1', value: '-121.88919' },
      { name: 'Lat2', value: '36.78427' },
      { name: 'Lon2', value: 'NaN' },
    ])

    // Check parameter overrides (depths, timeouts, and other parameters)
    expect(result.parameterOverrides).toEqual([
      { name: 'MissionTimeout', value: '13' },
      { name: 'NeedCommsTime', value: '90' },
      { name: 'Depth1', value: '250' },
      { name: 'Depth2', value: '250' },
      { name: 'Depth3', value: 'NaN' },
      { name: 'Repeat', value: '12' },
      { name: 'ApproachDepth', value: '10' },
      { name: 'ApproachSpeed', value: '1.0' },
      { name: 'SlowSpeed', value: '0.4' },
      { name: 'MinAltitude', value: '10' },
      { name: 'MaxDepth', value: '270' },
      { name: 'SampleLoad1', value: '1' },
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
    expect(result.waypointOverrides).not.toContainEqual({
      name: 'Lat3',
      value: '36.79279 degree',
    })

    expect(result.parameterOverrides).toEqual(
      expect.arrayContaining([
        { name: 'Lat3', value: '36.79279' },
        { name: 'Param1', value: 'value1' },
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
    })
    expect(result.parameterOverrides).toContainEqual({
      name: 'Depth2',
      value: '50',
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
    })
    expect(result.waypointOverrides).toContainEqual({
      name: 'TransitLongitude',
      value: '-122.1',
    })
    expect(result.parameterOverrides).not.toContainEqual({
      name: 'TransitLatitude',
      value: '36.9',
    })
  })
})
