import {
  extractOverridesWithScriptMetadata,
  hasNonstandardLatLonInParameterOverrides,
} from './extractOverridesWithScriptMetadata'
import type { GetScriptResponse } from '../Command/getScript'

describe('hasNonstandardLatLonInParameterOverrides', () => {
  it('is false when no lat/lon-like names', () => {
    expect(
      hasNonstandardLatLonInParameterOverrides([
        { name: 'MaxDepth', value: '30', unit: 'm' },
      ])
    ).toBe(false)
  })

  it('is true for Lat1-style names', () => {
    expect(
      hasNonstandardLatLonInParameterOverrides([
        { name: 'Lat1', value: '36', unit: 'degree' },
      ])
    ).toBe(true)
  })
})

describe('extractOverridesWithScriptMetadata', () => {
  it('does not call fetchScript when no ambiguous lat/lon params', async () => {
    const fetchScript = jest.fn()
    const cmd = 'load a/b.xml;set foo.MaxDepth 30 m;run'
    const result = await extractOverridesWithScriptMetadata(
      cmd,
      'a/b.xml',
      fetchScript
    )
    expect(fetchScript).not.toHaveBeenCalled()
    expect(result.parameterOverrides.some((o) => o.name === 'MaxDepth')).toBe(
      true
    )
  })

  it('does not call fetchScript when missionPath is missing', async () => {
    const fetchScript = jest.fn()
    const cmd =
      'load a/b.xml;set foo.CenterLat 36 degree;set foo.CenterLon -122 degree;run'
    await extractOverridesWithScriptMetadata(cmd, undefined, fetchScript)
    expect(fetchScript).not.toHaveBeenCalled()
  })

  it('refines overrides when fetch returns latLonNamePairs', async () => {
    const script: GetScriptResponse = {
      id: 'x',
      scriptArgs: [],
      latLonNamePairs: [{ latName: 'CenterLat', lonName: 'CenterLon' }],
    }
    const fetchScript = jest.fn().mockResolvedValue(script)
    const cmd =
      'load a/b.xml;set foo.CenterLat 36 degree;set foo.CenterLon -122 degree;run'
    const result = await extractOverridesWithScriptMetadata(
      cmd,
      'a/b.xml',
      fetchScript,
      { logContext: 'a/b.xml' }
    )
    expect(fetchScript).toHaveBeenCalledTimes(1)
    expect(result.waypointOverrides.length).toBeGreaterThan(0)
    expect(result.parameterOverrides.some((o) => o.name === 'CenterLat')).toBe(
      false
    )
  })

  it('returns initial overrides when fetch throws', async () => {
    const fetchScript = jest.fn().mockRejectedValue(new Error('network'))
    const cmd =
      'load a/b.xml;set foo.CenterLat 36 degree;set foo.Other 1 bool;run'
    const result = await extractOverridesWithScriptMetadata(
      cmd,
      'a/b.xml',
      fetchScript
    )
    expect(result.parameterOverrides.some((o) => o.name === 'CenterLat')).toBe(
      true
    )
  })
})
