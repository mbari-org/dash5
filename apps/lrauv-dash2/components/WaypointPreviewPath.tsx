import React, { useEffect, useRef } from 'react'
import { useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-polylinedecorator'
import { WAYPOINT_ICON_COLOR } from './WaypointIcon'

export interface Coord {
  lat: number
  lon: number
}

const WaypointPreviewPath: React.FC<{
  waypoints?: Coord[]
  fitTrigger?: number
}> = ({ waypoints, fitTrigger }) => {
  const map = useMap()

  const polyRef = useRef<L.Polyline | null>(null)
  const fit = useRef<string | null | undefined>(null)
  const lastFitTrigger = useRef<number | null | undefined>(null)
  const route = waypoints
  const routeAsString = waypoints?.flat().join()
  const decorator = useRef<L.PolylineDecorator | null>(null)
  const color = WAYPOINT_ICON_COLOR

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
    const routeChanged = fit.current !== routeAsString
    const triggerChanged =
      fitTrigger != null && fitTrigger !== lastFitTrigger.current

    if (routeChanged || triggerChanged) {
      if (route?.length) {
        try {
          map.fitBounds(
            route.map((r) => [r.lat, r.lon]) as [number, number][],
            { animate: false }
          )
          fit.current = routeAsString
        } catch {
          // noop; map pane may not be ready — leave fit.current unchanged so
          // a subsequent render can retry fitBounds for the same route
        }
      } else {
        // Route cleared — update fit.current so that re-selecting the same
        // waypoints later triggers fitBounds again instead of being skipped.
        fit.current = routeAsString
      }
      lastFitTrigger.current = fitTrigger
    }
    return () => {
      if (decorator.current) {
        decorator.current.removeFrom(map)
      }
    }
  }, [route, map, routeAsString, color, fitTrigger])
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
