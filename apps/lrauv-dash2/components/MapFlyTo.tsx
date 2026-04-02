import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSelectedStations } from './SelectedStationContext'

/**
 * When a GeoJSON dataset straddles the antimeridian (International Date Line)
 * some coordinates will have positive longitudes (e.g. Aleutian Islands at
 * ~+170°E) while the rest are in the western hemisphere (negative longitudes).
 * Leaflet's plain getBounds() then produces a >300° wide box whose center
 * falls somewhere near Europe.
 *
 * This function detects that case (raw span > 200°) and renormalizes the
 * eastern-hemisphere coordinates by subtracting 360°, producing a correct
 * western-hemisphere bounding box.
 */
function antimeridianAwareBounds(
  geojson: GeoJSON.GeoJsonObject
): L.LatLngBounds | null {
  try {
    const layer = L.geoJSON(geojson)
    const raw = layer.getBounds()
    if (!raw.isValid()) return null

    const span = raw.getEast() - raw.getWest()
    if (span <= 200) return raw // no antimeridian crossing, use as-is

    // Collect every lat/lng from the rendered layer and renormalize any
    // eastern-hemisphere lngs when the dataset is primarily western.
    const lats: number[] = []
    const lngs: number[] = []

    layer.eachLayer((sublayer) => {
      const poly = sublayer as L.Polyline
      if (typeof poly.getLatLngs !== 'function') return
      const flatten = (ll: unknown): void => {
        if (Array.isArray(ll)) {
          ll.forEach(flatten)
        } else if (ll && typeof (ll as L.LatLng).lat === 'number') {
          lats.push((ll as L.LatLng).lat)
          lngs.push((ll as L.LatLng).lng)
        }
      }
      flatten(poly.getLatLngs())
    })

    if (lngs.length === 0) return raw

    const westCount = lngs.filter((lng) => lng < 0).length
    const eastCount = lngs.filter((lng) => lng > 0).length
    const normalized = lngs.map((lng) =>
      // If most coords are western-hemisphere, wrap any eastern outliers
      westCount >= eastCount && lng > 90 ? lng - 360 : lng
    )

    return L.latLngBounds(
      [Math.min(...lats), Math.min(...normalized)],
      [Math.max(...lats), Math.max(...normalized)]
    )
  } catch {
    return null
  }
}

const MapFlyTo: React.FC = () => {
  const map = useMap()
  const { flyToRequest, setFlyToRequest } = useSelectedStations()

  useEffect(() => {
    if (flyToRequest) {
      if (flyToRequest.geoJson) {
        try {
          const bounds = antimeridianAwareBounds(
            flyToRequest.geoJson as GeoJSON.GeoJsonObject
          )
          if (bounds && bounds.isValid()) {
            // maxZoom:10 prevents flying in too close on small polygons;
            // the antimeridian normalization above prevents flying out to
            // Europe/Africa on date-line-crossing datasets like Aleutians.
            map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 10 })
          }
        } catch {
          map.flyTo(
            [flyToRequest.lat, flyToRequest.lon],
            Math.max(map.getZoom(), 13)
          )
        }
      } else {
        map.flyTo(
          [flyToRequest.lat, flyToRequest.lon],
          Math.max(map.getZoom(), 13)
        )
      }
      setFlyToRequest(null)
    }
  }, [flyToRequest, map, setFlyToRequest])

  return null
}

export default MapFlyTo
