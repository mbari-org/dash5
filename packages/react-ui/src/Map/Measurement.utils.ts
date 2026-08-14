import L from 'leaflet'

export type SymbolFeature = 'point' | 'line' | 'area'

/** Click within this many screen pixels of the first vertex closes the polygon. */
export const CLOSE_RADIUS_PX = 24

/** Finish classification: 3+ vertices stay a line unless the user closed. */
export const classifyMeasurement = (
  vertexCount: number,
  isClosed: boolean
): SymbolFeature => {
  if (isClosed && vertexCount >= 3) return 'area'
  if (vertexCount === 1) return 'point'
  return 'line'
}

export const isWithinCloseRadius = (
  pixelDistance: number,
  radiusPx = CLOSE_RADIUS_PX
): boolean => pixelDistance <= radiusPx

export const isNearFirstVertex = (
  click: L.LatLng,
  first: L.LatLng,
  map: L.Map,
  radiusPx = CLOSE_RADIUS_PX
): boolean => {
  const clickPt = map.latLngToContainerPoint(click)
  const firstPt = map.latLngToContainerPoint(first)
  return isWithinCloseRadius(clickPt.distanceTo(firstPt), radiusPx)
}
