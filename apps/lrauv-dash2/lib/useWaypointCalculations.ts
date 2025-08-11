import { useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { point, distance } from '@turf/turf'
import { WaypointProps } from '@mbari/react-ui'

const parseCoord = (v?: string): number | null => {
  if (v == null) return null
  const s = v.trim().toLowerCase()
  if (!s || s === 'nan') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

const inRange = (lat: number, lon: number) =>
  lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180

export const useWaypointCalculations = (updatedWaypoints: WaypointProps[]) =>
  useMemo<{ estDistance: number | null }>(() => {
    const pts: [number, number][] = []

    updatedWaypoints.forEach((w) => {
      const lat = parseCoord(w.lat)
      const lon = parseCoord(w.lon)
      if (lat === null || lon === null || !inRange(lat, lon)) return
      // Turf expects [lon, lat]
      pts.push([lon, lat])
    })

    if (pts.length < 2) {
      return { estDistance: null }
    }

    try {
      let km = 0
      for (let i = 1; i < pts.length; i++) {
        km += distance(point(pts[i - 1]), point(pts[i]), {
          units: 'kilometers',
        })
      }
      return { estDistance: km }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast.error(`Distance calculation failed: ${msg}`)
      console.error('Error calculating waypoint distance:', e)
      return { estDistance: null }
    }
  }, [updatedWaypoints])
