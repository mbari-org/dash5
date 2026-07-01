import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  useVehiclePos,
  useLastDeployment,
  VPosDetail,
  useWaypointsInfo,
} from '@mbari/api-client'
import { Polyline, useMap, Circle, CircleMarker, Tooltip } from 'react-leaflet'
import { LatLng, LeafletMouseEventHandlerFn } from 'leaflet'
import { useRouter } from 'next/router'
import { distance, nearestPointOnLine, lineString } from '@turf/turf'
import { useSharedPath } from './SharedPathContextProvider'
import { parseISO, getTime } from 'date-fns'
import { formatElapsedTime } from '@mbari/utils'
import { useVehicleColors } from './VehicleColorsContext'

const getDistance = (a: VPosDetail, b: LatLng) =>
  distance([a.longitude, a.latitude], [b.lng, b.lat])

// VehiclePoint component
const VehiclePoint: React.FC<{
  position: [number, number]
  color: string
  radius?: number
  opacity?: number
  fillOpacity?: number
  eventHandlers?: any
  children?: React.ReactNode
}> = ({
  position,
  color,
  radius = 10,
  opacity = 1,
  fillOpacity = 1,
  eventHandlers,
  children,
}) => (
  <Circle
    center={{ lat: position[0], lng: position[1] }}
    pathOptions={{ color, opacity }}
    fillColor={color}
    fillOpacity={fillOpacity}
    radius={radius}
    eventHandlers={eventHandlers}
  >
    {children}
  </Circle>
)

// Memoized hit-circle layer so it never re-renders when VehiclePath state
// (mapHoverFix, indicatorTime, etc.) changes — prevents React-Leaflet from
// re-mounting the circles and emitting spurious mouseout/mouseover events.
const HitCircles = React.memo(
  ({
    name,
    grouped,
    route,
    color,
    onCoord,
    onMouseOut,
  }: {
    name: string
    grouped?: boolean
    route: [number, number][]
    color: string
    onCoord: LeafletMouseEventHandlerFn
    onMouseOut: LeafletMouseEventHandlerFn
  }) => (
    <>
      {route.map((r, index) => (
        <Circle
          key={`${name}:${
            grouped ? 'overview' : 'detail'
          }:touch:${index}:${r.join()}`}
          center={{ lat: r[0], lng: r[1] }}
          fillColor={color}
          radius={200}
          fillOpacity={0}
          color={color}
          opacity={0}
          eventHandlers={{ mouseover: onCoord, mouseout: onMouseOut }}
        />
      ))}
    </>
  )
)
HitCircles.displayName = 'HitCircles'

// VehiclePathProps interface
interface VehiclePathProps {
  name: string
  grouped?: boolean
  from?: number
  to?: number
  indicatorTime?: number | null
  /** Time used exclusively for track split/dimming — set only from timeline
   *  bar hover so map-hover scrubbing shows the indicator without dimming. */
  dimTime?: number | null
  onScrub?: (millis?: number | null) => void
  onGPSFix?: (gps: VPosDetail) => void
  onPositionDataLoaded?: () => void
  disableAutoFit?: boolean
}

// VehiclePath component
const VehiclePath: React.FC<VehiclePathProps> = ({
  name,
  grouped,
  to,
  from,
  indicatorTime,
  dimTime,
  onScrub: handleScrub,
  onGPSFix: handleGPSFix,
  onPositionDataLoaded,
  disableAutoFit = false,
}) => {
  const map = useMap()
  const router = useRouter()
  const { sharedPath, dispatch } = useSharedPath()

  const { data: lastDeployment } = useLastDeployment(
    {
      vehicle: name,
    },
    { staleTime: 5 * 60 * 1000, enabled: !from }
  )
  // Default to 24 hours ago if no deployment data is available
  // Memoize to prevent query key from changing on every render
  const defaultFrom = useMemo(() => Date.now() - 24 * 60 * 60 * 1000, [])
  const { data: vehiclePosition } = useVehiclePos(
    {
      vehicle: name as string,
      from: from ? from : lastDeployment?.startEvent?.unixTime ?? defaultFrom,
      to: from ? to : lastDeployment?.endEvent?.unixTime,
    },
    {
      enabled: !!from || !!lastDeployment?.startEvent?.unixTime,
    }
  )

  const { data: futureWaypoints } = useWaypointsInfo(
    { vehicle: name },
    { enabled: !!name }
  )

  // Path/Point Stylization
  const { vehicleColors } = useVehicleColors()
  const customColors: Record<string, string> = useMemo(() => ({}), [])
  const [color, setColor] = useState(
    vehicleColors[name] || customColors[name] || '#ccc'
  )

  const [lineStyle, setLineStyle] = useState({
    color,
    weight: 3,
  })

  useEffect(() => {
    // Update line style whenever vehicleColors changes
    setLineStyle({
      color: vehicleColors[name] || customColors[name] || '#ccc',
      weight: 3,
    })
  }, [vehicleColors, name, customColors])

  useEffect(() => {
    setColor(vehicleColors[name] || customColors[name] || '#ccc')
  }, [vehicleColors, name, customColors])

  // Handle GPS Fixes
  const latestGPS = useRef<[number, number] | undefined>()
  const hasNotifiedDataLoaded = useRef(false)

  useEffect(() => {
    if (vehiclePosition?.gpsFixes && vehiclePosition.gpsFixes.length > 0) {
      const latest = vehiclePosition?.gpsFixes[0]
      const latestCoordNotAvailable = !latest?.latitude || !latest?.longitude
      const coordinatesAlreadyCurrent =
        latestGPS.current &&
        latestGPS.current[0] === latest?.latitude &&
        latestGPS.current[1] === latest?.longitude
      if (latestCoordNotAvailable || coordinatesAlreadyCurrent) {
        return
      }
      latestGPS.current = [latest.latitude, latest.longitude]
      handleGPSFix?.(latest)
    }
  }, [vehiclePosition, handleScrub, handleGPSFix])

  // Notify parent once when position data is available (for refresh "first load" countdown)
  useEffect(() => {
    if (
      !onPositionDataLoaded ||
      hasNotifiedDataLoaded.current ||
      !vehiclePosition?.gpsFixes?.length
    )
      return
    hasNotifiedDataLoaded.current = true
    onPositionDataLoaded()
  }, [vehiclePosition?.gpsFixes, onPositionDataLoaded])

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mapHoverFix, setMapHoverFix] = useState<VPosDetail | null>(null)
  const lastHoveredFixTimeRef = useRef<number | null>(null)
  // Refs keep handleCoord/handleMouseOut deps-free so they never change
  // reference — preventing HitCircles from re-rendering on every poll/render.
  const gpsFixesRef = useRef(vehiclePosition?.gpsFixes)
  const handleScrubRef = useRef(handleScrub)
  gpsFixesRef.current = vehiclePosition?.gpsFixes
  handleScrubRef.current = handleScrub

  const handleCoord: LeafletMouseEventHandlerFn = useCallback((e) => {
    if (timeout.current) clearTimeout(timeout.current)
    let coord: VPosDetail | null = null
    let bestDist = Infinity
    for (const fix of gpsFixesRef.current ?? []) {
      const d = getDistance(fix, e.latlng)
      if (d < bestDist) {
        bestDist = d
        coord = fix
      }
    }
    if (coord && coord.unixTime !== lastHoveredFixTimeRef.current) {
      lastHoveredFixTimeRef.current = coord.unixTime
      handleScrubRef.current?.(coord.unixTime)
      setMapHoverFix(coord)
    }
  }, []) // stable forever — reads live values via refs

  const handleMouseOut: LeafletMouseEventHandlerFn = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      handleScrubRef.current?.(null)
      setMapHoverFix(null)
      lastHoveredFixTimeRef.current = null
    }, 1000)
  }, []) // stable forever — reads live values via refs

  // Clear pending timeout on unmount to prevent state updates after removal
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  // Convert minutes to hours, minutes
  const convertMin2HrMin = (timeDiff: number) => {
    // Get total hours and minutes
    const hours = Math.floor(timeDiff / 60)
    const minutes = Math.round(timeDiff % 60)

    if (hours != 0) {
      timeSinceFix = hours + 'hr' + ', ' + minutes + 'min'
    } else {
      timeSinceFix = minutes + 'min'
    }
    return { hours, minutes, timeSinceFix }
  }

  // route
  const route = useMemo(
    () =>
      vehiclePosition?.gpsFixes?.map(
        (g) => [g.latitude, g.longitude] as [number, number]
      ) ?? [],
    [vehiclePosition?.gpsFixes]
  )

  const futureRoute = useMemo(() => {
    const pts = futureWaypoints?.points
    if (!pts?.length) return null
    const latest = vehiclePosition?.gpsFixes?.[0]
    const start =
      latest?.latitude != null && latest?.longitude != null
        ? [[latest.latitude, latest.longitude] as [number, number]]
        : []

    // The /wp endpoint returns all planned waypoints for the mission, including
    // those the vehicle has already passed. Find the first waypoint that is
    // still ahead of the vehicle by projecting the vehicle's position onto the
    // full route polyline and walking cumulative segment distances — this avoids
    // a backward leg even when the vehicle has just passed a waypoint and the
    // nearest vertex is still the one behind it.
    let startIdx = 0
    if (
      pts.length >= 2 &&
      latest?.latitude != null &&
      latest?.longitude != null
    ) {
      const routeLine = lineString(pts.map((p) => [p.lon, p.lat]))
      const snapped = nearestPointOnLine(routeLine, [
        latest.longitude,
        latest.latitude,
      ])
      // Distance along the route to the vehicle's nearest projection point.
      const vehicleDist = snapped.properties.location ?? 0
      // Walk cumulative segment distances to find the first waypoint whose
      // cumulative distance >= vehicleDist (i.e., still ahead of the vehicle).
      let cumDist = 0
      startIdx = pts.length - 1 // fallback: show only the final waypoint if vehicle is past all others
      for (let i = 0; i < pts.length; i++) {
        if (cumDist >= vehicleDist) {
          startIdx = i
          break
        }
        if (i < pts.length - 1) {
          cumDist += distance(
            [pts[i].lon, pts[i].lat],
            [pts[i + 1].lon, pts[i + 1].lat]
          )
        }
      }
    }
    const remainingPts = pts.slice(startIdx)
    if (remainingPts.length === 0) return null

    const positions = [
      ...start,
      ...remainingPts.map((p) => [p.lat, p.lon] as [number, number]),
    ]
    // Leaflet polylines require at least 2 points; guard to avoid runtime errors
    // when there is no GPS fix yet and only one remaining waypoint.
    if (positions.length < 2) return null
    return positions
  }, [futureWaypoints?.points, vehiclePosition?.gpsFixes])

  const fitPositions = useMemo(() => {
    const current = route ?? []
    const future = futureRoute ?? []
    const all = [...current, ...future]
    if (all.length === 0) return null
    const seen = new Set<string>()
    const deduped = all.filter((p) => {
      const key = `${p[0]},${p[1]}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return deduped
  }, [route, futureRoute])

  // DEPLOYMENT MAP — scrubbing-derived values
  // dimTime   → set only from the timeline bar → drives track split/dimming
  // indicatorTime → set from timeline bar OR map hover → drives indicator dot
  const gpsFixes = vehiclePosition?.gpsFixes ?? null

  // Show all GPS surfacing fixes so dots appear across the full deployment
  // track, not just the most recent segment. gpsFixes is already bounded by
  // the deployment window query, so the array is not unbounded.
  const displayedFixes = gpsFixes ?? []

  // Track-split: which fixes are in the "past" relative to dimTime
  const activePoints = useMemo(() => {
    if (!dimTime || dimTime <= 0 || !gpsFixes) return null
    const points = gpsFixes.filter((fix) => fix.unixTime <= dimTime)
    return points.length > 0 ? points : null
  }, [dimTime, gpsFixes])

  const activeRoute = useMemo(
    () =>
      activePoints?.map((g) => [g.latitude, g.longitude] as [number, number]) ??
      null,
    [activePoints]
  )

  // dimCoord: boundary point for the future segment (uses dimTime)
  const dimCoord = useMemo(() => {
    if (!dimTime || !activePoints?.length) return null
    return activePoints.reduce((latest, fix) =>
      fix.unixTime > latest.unixTime ? fix : latest
    )
  }, [dimTime, activePoints])

  // indicatorCoord: position marker shown from ANY scrub source (uses indicatorTime)
  const indicatorCoord = useMemo(() => {
    if (!indicatorTime || !gpsFixes?.length) return null
    const pastFixes = gpsFixes.filter((fix) => fix.unixTime <= indicatorTime)
    if (!pastFixes.length) return null
    return pastFixes.reduce((latest, fix) =>
      fix.unixTime > latest.unixTime ? fix : latest
    )
  }, [indicatorTime, gpsFixes])

  // Compute the future segment and deduplicate adjacent identical points in
  // one memo so both the dashed Polyline and preview Circles share the same
  // stable array reference without redundant work.
  const dedupedInactiveRoute = useMemo(() => {
    if (!dimTime || !gpsFixes) return null
    const futureFixes = gpsFixes
      .filter((fix) => fix.unixTime >= dimTime)
      .sort((a, b) => a.unixTime - b.unixTime)
    const raw = [dimCoord, ...futureFixes]
      .filter((g) => g && g.latitude != null && g.longitude != null)
      .map((g) => [g!.latitude, g!.longitude] as [number, number])
    const deduped = raw.filter(
      (r, i, arr) => i === 0 || r[0] !== arr[i - 1][0] || r[1] !== arr[i - 1][1]
    )
    // Leaflet polylines require at least 2 points; a single-point or empty
    // future segment means there is no future track to render.
    return deduped.length >= 2 ? deduped : null
  }, [dimTime, gpsFixes, dimCoord])

  const fitRef = useRef<string | null | undefined>(null)
  const fitPositionsAsString = fitPositions?.flat().join()

  // Fit bounds for Deployment Map
  useEffect(() => {
    //  Disable map auto-fit centering when the user interacts with timeline.
    if (
      fitRef.current !== fitPositionsAsString &&
      fitPositions &&
      !disableAutoFit
    ) {
      if (!grouped) {
        dispatch({ type: 'clear' })
        if (fitPositions?.length) {
          try {
            map.fitBounds(fitPositions, {
              paddingBottomRight: [0, 320], // Add bottom padding to deployment map to show path above the vehicle diagram
              animate: false, // Prevent zoom animation race with React re-renders on initial load
            })
            fitRef.current = fitPositionsAsString
          } catch {
            // noop; map pane may not be ready — leave fitRef.current unchanged
            // so a subsequent render can retry fitBounds for the same bounds
          }
        }
      } else {
        dispatch({ type: 'append', coords: { [name]: fitPositions } })
        fitRef.current = fitPositionsAsString
      }
    }
  }, [
    fitPositions,
    map,
    dispatch,
    name,
    grouped,
    fitPositionsAsString,
    disableAutoFit,
  ])

  // OVERVIEW MAP
  // Re-run grouped fitBounds on route/tab switches after layout settles.
  useEffect(() => {
    if (!grouped) return

    const coords = Object.values(sharedPath).flat()
    if (coords.length <= 1) return

    const applyFit = () => {
      try {
        map.invalidateSize()
        map.fitBounds(coords, { animate: false })
      } catch {
        // noop; next delayed retry may succeed after layout settles
      }
    }

    applyFit()
    const timers = [250, 800].map((delay) => setTimeout(applyFit, delay))
    return () => timers.forEach((t) => clearTimeout(t))
  }, [sharedPath, grouped, map, router.asPath])

  // Determine Time Difference since last gpsFix
  const latest =
    vehiclePosition?.gpsFixes && vehiclePosition.gpsFixes.length > 0
      ? vehiclePosition.gpsFixes[0]
      : null
  // IsoTime as a string
  const latestTimeFix = latest?.isoTime?.toString()
  let [timeSinceFix, setTimeSinceFix] = useState('')

  if (latestTimeFix) {
    const parsedDate = parseISO(latestTimeFix)
    const epochMSeconds = getTime(parsedDate)

    if (epochMSeconds) {
      const timeDiff = (Date.now() - epochMSeconds) / 60000
      convertMin2HrMin(timeDiff)
    }
  }

  // Derived for tooltip (compact format, updates on re-render)
  const timeSinceFixDisplay = latestTimeFix
    ? formatElapsedTime(Date.now() - getTime(parseISO(latestTimeFix)))
    : ''

  return route?.length ? (
    <>
      {/* When split mode is active (dimTime set) only render the past segment.
          If there are no past fixes yet (before first GPS fix), render nothing
          rather than falling back to the full route which would double-draw
          under the dashed future segment. */}
      {(!dimTime || activeRoute) && (
        <Polyline
          pathOptions={lineStyle}
          positions={activeRoute ?? route}
          color={color}
          eventHandlers={{
            mouseover: () => {
              setLineStyle({ color, weight: 5 })
            },
            mouseout: () => {
              setLineStyle({ color, weight: 3 })
            },
          }}
        >
          {/* Sticky tooltip on the track line — vehicle name + position count */}
          <Tooltip sticky opacity={0.88}>
            <div className="text-xs leading-snug">
              <div className="font-bold" style={{ color }}>
                {name}
              </div>
              <div>Positions: {displayedFixes.length}</div>
            </div>
          </Tooltip>
        </Polyline>
      )}
      {/* dashed future waypoint trajectory */}
      {futureRoute && (
        <Polyline
          positions={futureRoute}
          pathOptions={{ color, weight: 5, opacity: 0.6, dashArray: '5, 10' }}
        />
      )}

      {/* small dotted circles around future waypoint positions (exclude latest position) */}
      {futureRoute &&
        futureRoute.slice(1).map((p, i) => (
          <Circle
            key={`${name}:future-ring:${i}:${p.join()}`}
            center={{ lat: p[0], lng: p[1] }}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '4, 4',
            }}
            radius={20}
          />
        ))}
      {latest && (
        <>
          {/* DEPLOYMENT AND OVERVIEW PAGE */}
          {/* Circle = large dotted indicator circle. */}
          <Circle
            data-vehicle-point={`${name}-latest`}
            center={{ lat: latest.latitude, lng: latest.longitude }}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '4, 4',
            }}
            radius={200}
          >
            <Tooltip
              className="text-bold text-purple"
              direction="right"
              offset={[10, 0]}
              opacity={0.4}
              permanent
            >
              {name}
            </Tooltip>
          </Circle>
        </>
      )}
      {/* Solid dot at the latest GPS fix — always visible, tooltip on hover only */}
      {latest && (
        <Circle
          pathOptions={{ color }}
          center={{ lat: latest.latitude, lng: latest.longitude }}
          fillColor={color}
          fillOpacity={1}
          color={color}
          radius={60}
        >
          <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
            <div>
              <div className="text-purple text-bold">{name}</div>
              <div>
                Latest position: {latest.latitude.toFixed(5)},{' '}
                {latest.longitude.toFixed(5)}
              </div>
              <div>
                {latest.isoTime.split('T')[0] +
                  ' ' +
                  latest.isoTime.split('T')[1].split('Z')[0]}
                {' - '}
                {timeSinceFixDisplay}
              </div>
            </div>
          </Tooltip>
        </Circle>
      )}
      {/* Scrub indicator dot — shown for any scrub source (depth chart, timeline)
          unless the map-hover highlight is already visible at that position */}
      {indicatorCoord && mapHoverFix?.unixTime !== indicatorCoord.unixTime && (
        <Circle
          center={{
            lat: indicatorCoord.latitude,
            lng: indicatorCoord.longitude,
          }}
          interactive={false}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 2,
          }}
          radius={40}
        />
      )}
      {/* Crumb trail dots — only shown while the timeline bar is being hovered */}
      {activeRoute &&
        activeRoute.map((r, i) => (
          <VehiclePoint
            key={`${name}:${
              grouped ? 'overview' : 'detail'
            }:preview:${i}:${r.join()}`}
            position={r}
            color={color}
            radius={10}
            opacity={1}
            fillOpacity={1}
          />
        ))}
      {/* Hover highlight — grows at the nearest fix when hovering the map track */}
      {mapHoverFix && (
        <Circle
          center={{ lat: mapHoverFix.latitude, lng: mapHoverFix.longitude }}
          interactive={false}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 2,
          }}
          radius={60}
        >
          <Tooltip permanent direction="right" offset={[10, 0]} opacity={0.95}>
            <div className="text-xs leading-snug">
              <div className="flex items-center gap-1 font-bold text-black">
                <span
                  style={{
                    background: color,
                    borderRadius: '50%',
                    width: 8,
                    height: 8,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {name}
              </div>
              <div className="text-gray-700 mt-0.5">
                {mapHoverFix.latitude.toFixed(5)},{' '}
                {mapHoverFix.longitude.toFixed(5)}
              </div>
              <div className="text-gray-600">
                {mapHoverFix.isoTime.replace('T', ' ').replace('Z', ' UTC')}
              </div>
            </div>
          </Tooltip>
        </Circle>
      )}
      {dedupedInactiveRoute && (
        <Polyline
          pathOptions={{ color, weight: 2, opacity: 0.5, dashArray: '4, 6' }}
          positions={dedupedInactiveRoute}
        />
      )}
      {dedupedInactiveRoute &&
        dedupedInactiveRoute.map((r, i) => (
          <Circle
            key={`${name}:${
              grouped ? 'overview' : 'detail'
            }:inactivePreview:${i}:${r.join()}`}
            center={{
              lat: r[0],
              lng: r[1],
            }}
            fillColor={color}
            radius={10}
            fillOpacity={0.5}
            color={color}
            opacity={0.5}
          />
        ))}
      {/* GPS surfacing dots along the full deployment track.
          Color props must be direct props on CircleMarker (not pathOptions)
          for react-leaflet to apply them correctly.
          interactive=false so HitCircles keep hover/scrub control. */}
      {displayedFixes.map((fix, index) => (
        <CircleMarker
          key={`${name}:surfacing:${fix.unixTime}`}
          center={{ lat: fix.latitude, lng: fix.longitude }}
          radius={index === 0 ? 5 : 3}
          color={color}
          fillColor={color}
          fillOpacity={index === 0 ? 1 : 0.7}
          weight={1}
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
            <div className="text-xs leading-snug">
              <div className="font-bold" style={{ color }}>
                {name}
              </div>
              <div>
                Lat/Lon: {fix.latitude.toFixed(5)}, {fix.longitude.toFixed(5)}
              </div>
              <div>
                {fix.isoTime.replace('T', ' ').replace('Z', '').trim()}
                {fix.note ? ` ${fix.note}` : ''}
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Memoized hit targets — isolated from VehiclePath re-renders to
          prevent spurious mouseout/mouseover events causing tooltip flicker. */}
      <HitCircles
        name={name}
        grouped={grouped}
        route={route}
        color={color}
        onCoord={handleCoord}
        onMouseOut={handleMouseOut}
      />

      {/* "Position before waypoint trajectory" — interactive marker rendered
          on top of hit circles so its tooltip is reachable on hover */}
      {futureRoute && latest && (
        <CircleMarker
          center={{ lat: latest.latitude, lng: latest.longitude }}
          radius={5}
          color={color}
          fillColor={color}
          fillOpacity={0.5}
          weight={2}
        >
          <Tooltip direction="right" offset={[6, 0]} opacity={0.9}>
            <div className="text-xs leading-snug">
              <div className="font-bold" style={{ color }}>
                {name}
              </div>
              <div>Position before waypoint trajectory</div>
              <div>
                Lat/Lon: {latest.latitude.toFixed(5)},{' '}
                {latest.longitude.toFixed(5)}
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      )}
    </>
  ) : null
}

export default VehiclePath
