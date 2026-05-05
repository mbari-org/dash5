import { esriTileUrl } from './esriTileUrl'

const BASE =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'

describe('esriTileUrl', () => {
  it('includes the provided API key as a token query param', () => {
    expect(esriTileUrl('my-test-key')).toBe(`${BASE}?token=my-test-key`)
  })

  it('URL-encodes the API key to handle special characters', () => {
    expect(esriTileUrl('key+with/special=chars')).toBe(
      `${BASE}?token=key%2Bwith%2Fspecial%3Dchars`
    )
  })

  it('does not contain a literal placeholder or XML tags', () => {
    const url = esriTileUrl('my-test-key')
    expect(url).not.toContain('REACT_APP')
    expect(url).not.toContain('ACCESS_TOKEN')
    expect(url).not.toContain('process.env')
    expect(url).not.toContain('undefined')
  })
})
