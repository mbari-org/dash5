import { abbreviateUnitsInCommand } from './abbreviateUnits'

const units = [
  { name: 'second', abbreviation: 'sec' },
  { name: 'meter', abbreviation: 'm' },
  { name: 'hour', abbreviation: 'h' },
  { name: 'minute', abbreviation: 'min' },
  { name: 'meter_per_second', abbreviation: 'm/s' },
  { name: 'degree', abbreviation: 'arcdeg' },
]

const getSci2Command = (
  extras: string = ''
): string => `sched asap "load Science/sci2_flat_and_level.tl;
set sci2_flat_and_level.Lat1 36.72912 degree;
set sci2_flat_and_level.Lon1 -121.87923 degree;
set sci2_flat_and_level.Lat2 36.73985 degree;
set sci2_flat_and_level.Lon2 -121.88404 degree;
set sci2_flat_and_level.Lat3 36.73214 degree;
set sci2_flat_and_level.Lon3 -121.89846 degree;
set sci2_flat_and_level:StandardEnvelopes.MinAltitude 10 meter;
set sci2_flat_and_level.MissionTimeout 10 hour;
set sci2_flat_and_level.NeedCommsTime 10 minute;
set sci2_flat_and_level.Depth1 10 meter;
set sci2_flat_and_level.Depth2 10 meter;
set sci2_flat_and_level.Depth3 10 meter;
set sci2_flat_and_level.ApproachSpeed 1 meter_per_second;
${extras}set sci2_flat_and_level:StandardEnvelopes.MinAltitude 10 meter;
run"`

describe('abbreviateUnitsInCommand (sci2_flat_and_level mission)', () => {
  it('abbreviates all applicable units while preserving “degree”', () => {
    const cmd = getSci2Command()
    const result = abbreviateUnitsInCommand(cmd, units)

    // Unit replacements
    expect(result).toContain(' 10 m;')
    expect(result).toContain(' 10 h;')
    expect(result).toContain(' 10 min;')
    expect(result).toContain(' 1 m/s;')
  })

  it('should not replace degree with arcdeg', () => {
    const cmd = getSci2Command()
    const result = abbreviateUnitsInCommand(cmd, units)
    expect(result).toContain('degree')
    expect(result).not.toContain('arcdeg')
  })

  it('does not alter parameter names containing unit substrings', () => {
    // Insert parameters whose names include “meter” or “second” inside a larger word
    const extras = `set sci2_flat_and_level.ThermometerReading 5 meter;\nset sci2_flat_and_level.SecondaryCheckTime 2 second;\n`
    const cmd = getSci2Command(extras)
    const result = abbreviateUnitsInCommand(cmd, units)

    // Parameter names should remain intact
    expect(result).toContain('ThermometerReading')
    expect(result).toContain('SecondaryCheckTime')

    expect(result).toContain(' 5 m;')
    expect(result).toContain(' 2 sec;')
  })

  it('handles units adjacent to semicolons and quotes correctly', () => {
    const extras = `set sci2_flat_and_level.Interval "1 second";\n`
    const cmd = getSci2Command(extras)
    const result = abbreviateUnitsInCommand(cmd, units)

    expect(result).toContain('"1 sec"')
    expect(result).toContain('"1 sec";')
  })
})
