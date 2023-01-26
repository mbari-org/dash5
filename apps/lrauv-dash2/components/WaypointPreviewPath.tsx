import React, { useEffect, useRef } from 'react'
import { useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-polylinedecorator'

export interface Coord {
  lat: number
  lon: number
}

const WaypointPreviewPath: React.FC<{
  waypoints?: Coord[]
}> = ({ waypoints }) => {
  const map = useMap()

  const polyRef = useRef<L.Polyline | null>(null)
  const fit = useRef<string | null | undefined>(null)
  const route = waypoints
  const routeAsString = waypoints?.flat().join()
  const decorator = useRef<L.PolylineDecorator | null>(null)
  const color = '#7e22ce'

  useEffect(() => {
    if (decorator.current) {
      decorator.current.removeFrom(map)
    }
    if (polyRef.current) {
      decorator.current = L.polylineDecorator(polyRef.current, {
        patterns: [
          {
            offset: 50,
            repeat: 100,
            symbol: L.Symbol.arrowHead({
              pixelSize: 12,
              polygon: false,
              pathOptions: { stroke: true, color },
            }),
          },
        ],
      }).addTo(map)
    }
    if (fit.current !== routeAsString && route) {
      if (route?.length) {
        map.fitBounds(route.map((r) => [r.lat, r.lon]) as [number, number][])
      }
      fit.current = routeAsString
    }
    return () => {
      if (decorator.current) {
        decorator.current.removeFrom(map)
      }
    }
  }, [route, map, routeAsString])
  return route ? (
    <>
      {waypoints && (
        <Polyline
          ref={polyRef}
          pathOptions={{ color, opacity: 0.7, dashArray: [10, 10] }}
          positions={waypoints.map((r) => [r.lat, r.lon])}
        />
      )}
    </>
  ) : null
}

export default WaypointPreviewPath
