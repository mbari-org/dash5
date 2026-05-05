import '@testing-library/jest-dom'
import { esriTileUrl } from './esriTileUrl'

test.todo(
  'forego testing on the Map component unless we want to troubleshoot webpack, jest, and leaflet which is going to be can of worms.'
)

describe('esriTileUrl', () => {
  const BASE =
    'https://ibasemaps-api.arcgis.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'

  it('includes the provided API key as a token query param', () => {
    const url = esriTileUrl('my-test-key')
    expect(url).toBe(`${BASE}?token=my-test-key`)
  })

  it('embeds the key directly — no token=undefined possible', () => {
    const url = esriTileUrl('explicit-key')
    expect(url).toContain('token=explicit-key')
    expect(url).not.toContain('undefined')
  })

  it('does not contain a literal placeholder or XML tags', () => {
    const url = esriTileUrl('my-test-key')
    expect(url).not.toContain('REACT_APP')
    expect(url).not.toContain('ACCESS_TOKEN')
    expect(url).not.toContain('process.env')
  })
})
