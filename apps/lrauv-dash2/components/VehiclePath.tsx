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
import {
  useSelectedLrauvsOptional,
  LRAUVS_ROOT_HOVER,
} from './SelectedLrauvsContext'
import {
  deduplicateFixesByUnixTime,
  countDisplayedPositions,
  recentPositionsWithinWindow,
  lrauvsRootHoverPositions,
} from '../lib/vehiclePathUtils'
import { GPS_FIXES_DISPLAY_CAP } from './LrauvsLayerSection'

const getDistance = (a: VPosDetail, b: LatLng) =>
  distance([a.longitude, a.latitude], [b.lng, b.lat])

// VehiclePoint component — uses CircleMarker (pixel radius) so dots stay
// the same visual size regardless of zoom level.
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
  radius = 4,
  opacity = 1,
  fillOpacity = 1,
  eventHandlers,
  children,
}) => (
  <CircleMarker
    center={{ lat: position[0], lng: position[1] }}
    pathOptions={{ color, opacity }}
    fillColor={color}
    fillOpacity={fillOpacity}
    radius={radius}
    eventHandlers={eventHandlers}
  >
    {children}
  </CircleMarker>
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
        <CircleMarker
          key={`${name}:${
            grouped ? 'overview' : 'detail'
          }:touch:${index}:${r.join()}`}
          center={{ lat: r[0], lng: r[1] }}
          fillColor={color}
          radius={18}
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
  const {
    isLeafChecked,
    registerVehicleCounts,
    registerVehiclePositions,
    hoverState,
  } = useSelectedLrauvsOptional()
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

  // Argos, Navigating to WPs, and Reached WPs follow Dash4:
  // last 24 hours, 20 is only the ceiling.
  // Tick once per minute so the window advances while the page stays mounted.
  const [minuteTick, setMinuteTick] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setMinuteTick(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const recentArgos = useMemo(
    () =>
      recentPositionsWithinWindow(vehiclePosition?.argoReceives, minuteTick),
    [vehiclePosition?.argoReceives, minuteTick]
  )
  const recentNavigatingToWaypoints = useMemo(
    () =>
      recentPositionsWithinWindow(
        vehiclePosition?.navigatingToWaypoints,
        minuteTick
      ),
    [vehiclePosition?.navigatingToWaypoints, minuteTick]
  )
  const recentReachedWaypoints = useMemo(
    () =>
      recentPositionsWithinWindow(
        vehiclePosition?.reachedWaypoints,
        minuteTick
      ),
    [vehiclePosition?.reachedWaypoints, minuteTick]
  )
  const recentEmergencies = useMemo(
    () => recentPositionsWithinWindow(vehiclePosition?.emergencies, minuteTick),
    [vehiclePosition?.emergencies, minuteTick]
  )

  // Register position counts and per-leaf position arrays with the layer context.
  // Counts drive tree labels; positions enable center-on-layer.
  useEffect(() => {
    if (!vehiclePosition) return
    registerVehicleCounts(name, {
      gpsFixes: vehiclePosition.gpsFixes?.length ?? 0,
      argos: recentArgos.length,
      navigatingToWaypoints: recentNavigatingToWaypoints.length,
      reachedWaypoints: recentReachedWaypoints.length,
      emergencies: recentEmergencies.length,
    })
    const latest = vehiclePosition?.gpsFixes?.[0]
    registerVehiclePositions(name, {
      markerPosition:
        latest?.latitude != null && latest?.longitude != null
          ? [latest.latitude, latest.longitude]
          : undefined,
      gpsFixes: deduplicateFixesByUnixTime(vehiclePosition.gpsFixes ?? []).map(
        (p) => [p.latitude, p.longitude] as [number, number]
      ),
      waypoints: [
        // Dash4 parity: prepend latestPosition (vehicle's current pos per /wp)
        // before the planned waypoints so the center-on bounds include the
        // vehicle's actual location even when it's between waypoints.
        ...(futureWaypoints?.latestPosition
          ? [
              [
                futureWaypoints.latestPosition.lat,
                futureWaypoints.latestPosition.lon,
              ] as [number, number],
            ]
          : []),
        ...(futureWaypoints?.points ?? []).map(
          (p) => [p.lat, p.lon] as [number, number]
        ),
      ],
      argos: recentArgos.map(
        (p) => [p.latitude, p.longitude] as [number, number]
      ),
      navigatingToWaypoints: recentNavigatingToWaypoints.map(
        (p) => [p.latitude, p.longitude] as [number, number]
      ),
      reachedWaypoints: recentReachedWaypoints.map(
        (p) => [p.latitude, p.longitude] as [number, number]
      ),
      emergencies: recentEmergencies.map(
        (p) => [p.latitude, p.longitude] as [number, number]
      ),
    })
  }, [
    name,
    vehiclePosition,
    futureWaypoints,
    recentArgos,
    recentNavigatingToWaypoints,
    recentReachedWaypoints,
    recentEmergencies,
    registerVehicleCounts,
    registerVehiclePositions,
  ])

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mapHoverFix, setMapHoverFix] = useState<VPosDetail | null>(null)
  const lastHoveredFixTimeRef = useRef<number | null>(null)
  // Refs keep handleCoord/handleMouseOut deps-free so they never change
  // reference — preventing HitCircles from re-rendering on every poll/render.
  // displayedFixesRef is updated below (after displayedFixes is computed) so
  // handleCoord always iterates the same deduplicated set used for rendering.
  const displayedFixesRef = useRef<VPosDetail[]>([])
  const handleScrubRef = useRef(handleScrub)
  handleScrubRef.current = handleScrub

  const handleCoord: LeafletMouseEventHandlerFn = useCallback((e) => {
    if (timeout.current) clearTimeout(timeout.current)
    let coord: VPosDetail | null = null
    let bestDist = Infinity
    for (const fix of displayedFixesRef.current) {
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
  // Deduplicate by unixTime — the API occasionally returns duplicate fixes
  // with the same timestamp, which causes React duplicate-key warnings.
  const displayedFixes = useMemo(
    () => deduplicateFixesByUnixTime(gpsFixes ?? []),
    [gpsFixes]
  )
  // Keep the ref in sync so handleCoord always iterates the same deduplicated
  // list that is used for rendering — consistent hover/scrub behaviour.
  displayedFixesRef.current = displayedFixes

  // Deduplicated position count for the "Positions: N" tooltip label.
  // When dimTime is active, count only fixes at or before that threshold.
  // Uses displayedFixes (already deduped) as the source to avoid over-counting
  // duplicate unixTime entries that exist in the raw gpsFixes array.
  const displayedPositionCount = useMemo(
    () => countDisplayedPositions(displayedFixes, dimTime),
    [displayedFixes, dimTime]
  )

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

  // showGpsFixes intentionally removed — GPS track dots, crumb trail,
  // hover highlight, and HitCircles are always rendered (Dash4 parity).
  // The GPS Fixes leaf only gates the layer-panel hover overlay rings.
  const showWaypoints = isLeafChecked(name, 'waypoints')
  const showArgos = isLeafChecked(name, 'argos')
  const showNavigatingToWaypoints = isLeafChecked(name, 'navigatingToWaypoints')
  const showReachedWaypoints = isLeafChecked(name, 'reachedWaypoints')
  const showEmergencies = isLeafChecked(name, 'emergencies')

  const gpsSection = route?.length ? (
    <>
      {/* When split mode is active (dimTime set) only render the past segment.
          If there are no past fixes yet (before first GPS fix), render nothing
          rather than falling back to the full route which would double-draw
          under the dashed future segment. */}
      {/* Main GPS track polyline — always visible regardless of GPS fixes
          leaf state. The leaf controls supplementary position markers only. */}
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
        />
      )}
      {/* dashed future waypoint trajectory */}
      {showWaypoints && futureRoute && (
        <Polyline
          positions={futureRoute}
          pathOptions={{ color, weight: 5, opacity: 0.6, dashArray: '5, 10' }}
        />
      )}

      {/* small dotted circles around future waypoint positions (exclude latest position) */}
      {showWaypoints &&
        futureRoute &&
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
      {/* GPS surfacing dots — always visible across the full deployment
          (Dash4 parity). Index 0 is the latest position rendered separately
          as the solid current-position dot; skip it here. Non-interactive.
          The GPS Fixes leaf checkbox controls the layer-panel hover overlay
          rings only — not these dots. */}
      {displayedFixes.map((fix, index) =>
        index === 0 ? null : (
          <CircleMarker
            key={`${name}:surfacing:${fix.eventId ?? fix.unixTime}`}
            center={{ lat: fix.latitude, lng: fix.longitude }}
            radius={2}
            color={color}
            fillColor={color}
            fillOpacity={0.7}
            weight={1}
            interactive={false}
          />
        )
      )}
      {/* Current vehicle position — always visible (fundamental "where is
          this vehicle" indicator). */}
      {latest && (
        <CircleMarker
          data-vehicle-point={`${name}-latest`}
          center={{ lat: latest.latitude, lng: latest.longitude }}
          radius={6}
          color="white"
          fillColor={color}
          fillOpacity={1}
          weight={2}
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
        </CircleMarker>
      )}
      {/* Scrub indicator dot — shown for any scrub source (depth chart, timeline)
          unless the map-hover highlight is already visible at that position.
          Rendered regardless of whether the GPS fixes leaf is checked so that
          scrubbing always shows where on the track the selected time falls. */}
      {indicatorCoord && mapHoverFix?.unixTime !== indicatorCoord.unixTime && (
        <CircleMarker
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
          radius={8}
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
            radius={4}
            opacity={1}
            fillOpacity={1}
          />
        ))}
      {/* Hover highlight — grows at the nearest fix when hovering the map track */}
      {mapHoverFix && (
        <CircleMarker
          center={{ lat: mapHoverFix.latitude, lng: mapHoverFix.longitude }}
          interactive={false}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 2,
          }}
          radius={10}
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
                {mapHoverFix.isoTime.replace('T', ' ').replace('Z', ' UTC')}{' '}
                <span className="text-[10px] italic text-gray-500">
                  -{formatElapsedTime(Date.now() - mapHoverFix.unixTime)}
                </span>
              </div>
              <div className="text-gray-500 mt-0.5">
                Positions: {displayedPositionCount}
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      )}
      {/* Dashed inactive/future track segment — always visible as part of the
          track line. The individual preview dots below are also always rendered. */}
      {dedupedInactiveRoute && (
        <Polyline
          pathOptions={{ color, weight: 2, opacity: 0.5, dashArray: '4, 6' }}
          positions={dedupedInactiveRoute}
        />
      )}
      {dedupedInactiveRoute &&
        dedupedInactiveRoute.map((r, i) => (
          <CircleMarker
            key={`${name}:${
              grouped ? 'overview' : 'detail'
            }:inactivePreview:${i}:${r.join()}`}
            center={{
              lat: r[0],
              lng: r[1],
            }}
            fillColor={color}
            radius={4}
            fillOpacity={0.5}
            color={color}
            opacity={0.5}
          />
        ))}

      {/* Memoized hit targets — isolated from VehiclePath re-renders to
          prevent spurious mouseout/mouseover events causing tooltip flicker. */}
      {
        <HitCircles
          name={name}
          grouped={grouped}
          route={route}
          color={color}
          onCoord={handleCoord}
          onMouseOut={handleMouseOut}
        />
      }
      {/* Invisible hit target for the latest-position tooltip — always
          rendered so the position tooltip is always reachable, even when
          the GPS fixes leaf is unchecked. */}
      {latest && (
        <CircleMarker
          center={{ lat: latest.latitude, lng: latest.longitude }}
          radius={12}
          color="transparent"
          fillColor="transparent"
          fillOpacity={0}
          weight={0}
        >
          <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
            <div className="text-xs leading-snug">
              <div className="flex items-center gap-1 font-bold text-black">
                <span
                  style={{
                    background: color,
                    border: '1.5px solid rgba(0,0,0,0.4)',
                    borderRadius: '50%',
                    width: 8,
                    height: 8,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {name}
              </div>
              {futureRoute && (
                <div className="text-gray-500 italic">
                  Position before waypoint trajectory
                </div>
              )}
              <div className="mt-0.5">
                {futureRoute ? 'Lat/Lon:' : 'Latest position:'}{' '}
                {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}
              </div>
              <div>
                {latestTimeFix?.replace('T', ' ').replace('Z', ' UTC')}{' '}
                <span className="text-[10px] italic text-gray-500">
                  -{formatElapsedTime(Date.now() - latest.unixTime)}
                </span>
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      )}
    </>
  ) : null

  return (
    <>
      {gpsSection}

      {/* ===== Argos positions ===== */}
      {showArgos &&
        recentArgos.map((point) => {
          // note stores the bare LC integer ("3", "2", "1", "0"); text may carry
          // an error description. Matches Dash4's qualForArgo / point[3] shape.
          const lcValue = point.note ? parseInt(point.note, 10) : NaN
          const hasError = !!point.text && !Number.isFinite(lcValue)
          const lcLabel = Number.isFinite(lcValue) ? `LC=${lcValue}` : undefined
          const accuracyRadii: Record<number, number> = {
            1: 1000,
            2: 2000,
            3: 3000,
          }
          const radiusMeters = Number.isFinite(lcValue)
            ? accuracyRadii[lcValue] ?? 0
            : 0
          const argoColor = hasError ? 'red' : color
          return (
            <React.Fragment
              key={`${name}:argo:${point.eventId ?? point.unixTime}`}
            >
              <CircleMarker
                center={{ lat: point.latitude, lng: point.longitude }}
                radius={4}
                color={argoColor}
                fillColor={argoColor}
                fillOpacity={0.7}
                weight={5}
              >
                <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
                  <div className="text-xs leading-snug">
                    <div className="font-bold">{name} Argos position</div>
                    <div>
                      {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                    </div>
                    {lcLabel && <div>{lcLabel}</div>}
                    {hasError && (
                      <div className="font-bold text-red-600">{point.text}</div>
                    )}
                    {!hasError && point.text && <div>{point.text}</div>}
                    <div>
                      {point.isoTime.replace('T', ' ').replace('Z', ' UTC')}{' '}
                      <span className="text-[10px] italic text-gray-500">
                        -{formatElapsedTime(Date.now() - point.unixTime)}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
              {radiusMeters > 0 && (
                <Circle
                  center={{ lat: point.latitude, lng: point.longitude }}
                  radius={radiusMeters}
                  pathOptions={{
                    color: argoColor,
                    weight: hasError ? 7 : 2,
                    opacity: 0.6,
                    dashArray: '5 7',
                    // Dash4 parity: fill is a fixed light blue regardless of
                    // vehicle color — both Pontus (orange) and Aku (orange) show
                    // the same blue fill in Dash4 screenshots.
                    fillColor: '#3388ff',
                    fillOpacity: 0.15,
                  }}
                />
              )}
            </React.Fragment>
          )
        })}

      {/* ===== Reached waypoints ===== */}
      {showReachedWaypoints &&
        recentReachedWaypoints.map((point) => (
          <CircleMarker
            key={`${name}:rwp:${point.eventId ?? point.unixTime}`}
            center={{ lat: point.latitude, lng: point.longitude }}
            radius={4}
            color={color}
            fillColor={color}
            fillOpacity={0.7}
            weight={2}
          >
            <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
              <div className="text-xs leading-snug">
                <div className="font-bold">{name}</div>
                <div>Reached waypoint</div>
                <div>
                  {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </div>
                <div>
                  {point.isoTime.replace('T', ' ').replace('Z', ' UTC')}{' '}
                  <span className="text-[10px] italic text-gray-500">
                    -{formatElapsedTime(Date.now() - point.unixTime)}
                  </span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

      {/* ===== Navigating to waypoints ===== */}
      {showNavigatingToWaypoints &&
        recentNavigatingToWaypoints.map((point) => (
          <CircleMarker
            key={`${name}:n2wp:${point.eventId ?? point.unixTime}`}
            center={{ lat: point.latitude, lng: point.longitude }}
            radius={4}
            color={color}
            fillColor={color}
            fillOpacity={0}
            weight={2}
            pathOptions={{ dashArray: '1 3' }}
          >
            <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
              <div className="text-xs leading-snug">
                <div className="font-bold">{name}</div>
                <div>Navigating to waypoint</div>
                <div>
                  {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </div>
                <div>
                  {point.isoTime.replace('T', ' ').replace('Z', ' UTC')}{' '}
                  <span className="text-[10px] italic text-gray-500">
                    -{formatElapsedTime(Date.now() - point.unixTime)}
                  </span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

      {/* ===== Emergencies ===== */}
      {showEmergencies &&
        recentEmergencies.map((point) => (
          <CircleMarker
            key={`${name}:emergency:${point.eventId ?? point.unixTime}`}
            center={{ lat: point.latitude, lng: point.longitude }}
            radius={10}
            color="red"
            fillOpacity={0}
            weight={7}
          >
            <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
              <div className="text-xs leading-snug">
                <div className="font-bold text-red-600">{name} Emergency</div>
                <div>
                  {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </div>
                <div>
                  {point.isoTime.replace('T', ' ').replace('Z', ' UTC')}{' '}
                  <span className="text-[10px] italic text-gray-500">
                    -{formatElapsedTime(Date.now() - point.unixTime)}
                  </span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

      {/* ===== Layer hover overlay (generic-points-marker parity) =====
          Rules:
          - Leaf row hover → only if that leaf is checked; show circles at
            that leaf's positions (waypoints capped at 20); permanent lat/lon
            tooltips at each point, plus a connecting line.
          - Vehicle row hover → yellow ring at the current location only.
          - LRAUVs root hover → yellow rings at every loaded point for this
            vehicle, including unchecked leaves. No line and no labels.
          - Every one of these hovers draws Dash4's small red center dot.
          - If no points are visible for the hovered scope, render nothing. */}
      {(() => {
        const { vehicleName: hoveredVehicle, leaf: hoveredLeaf } = hoverState
        const isHovered =
          hoveredVehicle === name || hoveredVehicle === LRAUVS_ROOT_HOVER
        if (!isHovered) return null

        const isLeafHover = hoveredLeaf !== null
        const isRootHover = hoveredVehicle === LRAUVS_ROOT_HOVER

        // Leaf hover: skip entirely when that leaf is not checked
        if (isLeafHover && !isLeafChecked(name, hoveredLeaf!)) return null

        let pts: [number, number][] = []
        const withTooltip = isLeafHover

        if (isLeafHover) {
          switch (hoveredLeaf) {
            case 'gpsFixes':
              // Use displayedFixes (deduplicated, same set as the visible dots)
              // so hover rings and dots are always in sync.
              pts = displayedFixes
                .slice(0, GPS_FIXES_DISPLAY_CAP)
                .map((p) => [p.latitude, p.longitude] as [number, number])
              break
            case 'waypoints':
              // Dash4 parity: allPoints = latestPosition + planned points.
              // Include the vehicle's current position as the first ring.
              pts = [
                ...(futureWaypoints?.latestPosition
                  ? [
                      [
                        futureWaypoints.latestPosition.lat,
                        futureWaypoints.latestPosition.lon,
                      ] as [number, number],
                    ]
                  : []),
                ...(futureWaypoints?.points ?? [])
                  .slice(0, 20)
                  .map((p) => [p.lat, p.lon] as [number, number]),
              ]
              break
            case 'argos':
              pts = recentArgos.map(
                (p) => [p.latitude, p.longitude] as [number, number]
              )
              break
            case 'navigatingToWaypoints':
              pts = recentNavigatingToWaypoints.map(
                (p) => [p.latitude, p.longitude] as [number, number]
              )
              break
            case 'reachedWaypoints':
              pts = recentReachedWaypoints.map(
                (p) => [p.latitude, p.longitude] as [number, number]
              )
              break
            case 'emergencies':
              pts = recentEmergencies.map(
                (p) => [p.latitude, p.longitude] as [number, number]
              )
              break
          }
        } else if (isRootHover) {
          pts = lrauvsRootHoverPositions({
            gpsFixes: vehiclePosition?.gpsFixes,
            argos: vehiclePosition?.argoReceives,
            navigatingToWaypoints: vehiclePosition?.navigatingToWaypoints,
            reachedWaypoints: vehiclePosition?.reachedWaypoints,
            emergencies: recentEmergencies,
            latestWaypointPosition: futureWaypoints?.latestPosition,
            waypoints: futureWaypoints?.points,
            now: minuteTick,
          })
        } else {
          // Vehicle name hover: yellow rings at all last-20 GPS positions
          // (Dash4 parity). No tooltips, no connecting line (withTooltip=false,
          // isLeafHover=false). Same set as the GPS Fixes leaf hover.
          pts = displayedFixes
            .slice(0, GPS_FIXES_DISPLAY_CAP)
            .map((p) => [p.latitude, p.longitude] as [number, number])
        }

        if (pts.length === 0) return null

        return (
          <>
            {/* Dash4 parity: yellow dashed connecting line through the leaf's
                points in sequence. Only drawn for leaf hovers. Rendered first
                so ring circles draw on top. */}
            {isLeafHover && pts.length > 1 && (
              <Polyline
                positions={pts.map((pt) => ({ lat: pt[0], lng: pt[1] }))}
                pathOptions={{
                  color: 'yellow',
                  weight: 4,
                  opacity: 0.9,
                  dashArray: '8 10',
                  interactive: false,
                }}
              />
            )}
            {pts.map((pt, i) => (
              <CircleMarker
                key={`${name}:hover-overlay:${i}`}
                center={{ lat: pt[0], lng: pt[1] }}
                radius={12}
                pathOptions={{
                  color: 'yellow',
                  weight: 2,
                  fillOpacity: 0,
                  dashArray: '5 4',
                  interactive: false,
                }}
              >
                {withTooltip && (
                  <Tooltip permanent direction="top" offset={[0, -14]}>
                    {`${pt[0].toFixed(3)}, ${pt[1].toFixed(3)}`}
                  </Tooltip>
                )}
              </CircleMarker>
            ))}
            {/* Dash4 sets this marker's radius to 0. Leaflet still strokes
                it, which reads as a red center dot on every hover ring. */}
            {pts.map((pt, i) => (
              <CircleMarker
                key={`${name}:hover-center:${i}`}
                center={{ lat: pt[0], lng: pt[1] }}
                radius={0}
                pathOptions={{
                  color: 'red',
                  weight: 3,
                  fillOpacity: 0,
                  dashArray: '14 6',
                  interactive: false,
                }}
              />
            ))}
          </>
        )
      })()}
    </>
  )
}

export default VehiclePath
