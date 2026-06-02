import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  useVehiclePos,
  useLastDeployment,
  VPosDetail,
  useWaypointsInfo,
} from '@mbari/api-client'
import { Polyline, useMap, Circle, Tooltip } from 'react-leaflet'
import { LatLng, LeafletMouseEventHandlerFn } from 'leaflet'
import { useRouter } from 'next/router'
import { distance } from '@turf/turf'
import { useSharedPath } from './SharedPathContextProvider'
import { parseISO, getTime } from 'date-fns'
import { formatElapsedTime } from '@mbari/utils'
import { useVehicleColors } from './VehicleColorsContext'

const getDistance = (a: VPosDetail, b: LatLng) =>
  distance([a.latitude, a.longitude], [b.lat, b.lng])

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
  const [mapHoverCoord, setMapHoverCoord] = useState<[number, number] | null>(
    null
  )

  const handleCoord: LeafletMouseEventHandlerFn = useCallback(
    (e) => {
      if (timeout.current) clearTimeout(timeout.current)
      const coord = [...(vehiclePosition?.gpsFixes ?? [])].sort(
        (a, b) => getDistance(a, e.latlng) - getDistance(b, e.latlng)
      )[0]
      handleScrub?.(coord?.unixTime)
      if (
        coord &&
        (coord.latitude !== mapHoverCoord?.[0] ||
          coord.longitude !== mapHoverCoord?.[1])
      ) {
        setMapHoverCoord([coord.latitude, coord.longitude])
      }
    },
    [timeout, handleScrub, vehiclePosition?.gpsFixes]
  )

  const handleMouseOut: LeafletMouseEventHandlerFn = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      handleScrub?.(null)
      setMapHoverCoord(null)
    }, 1000)
  }, [timeout, handleScrub])

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

  const [tooltipVisible, setTooltipVisible] = useState(false)
  const handleTTVisible = () => {
    setTooltipVisible(true)
  }
  const handleTTHidden = () => {
    setTooltipVisible(false)
  }

  // route
  const route = vehiclePosition?.gpsFixes?.map(
    (g) => [g.latitude, g.longitude] as [number, number]
  )

  const futureRoute = useMemo(() => {
    const pts = futureWaypoints?.points
    if (!pts?.length) return null
    const latest = vehiclePosition?.gpsFixes?.[0]
    const start =
      latest?.latitude != null && latest?.longitude != null
        ? [[latest.latitude, latest.longitude] as [number, number]]
        : []
    return [...start, ...pts.map((p) => [p.lat, p.lon] as [number, number])]
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

  // Track-split: which fixes are in the "past" relative to dimTime
  const activePoints = useMemo(
    () =>
      dimTime && dimTime > 0 && gpsFixes
        ? gpsFixes.filter((fix) => fix.unixTime <= dimTime)
        : null,
    [dimTime, gpsFixes]
  )

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
    if (!indicatorTime || !indicatorTime || !gpsFixes?.length) return null
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
    return raw.filter(
      (r, i, arr) => i === 0 || r[0] !== arr[i - 1][0] || r[1] !== arr[i - 1][1]
    )
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
      {/* DEPLOYMENT MAP VEHICLE VIEW */}
      {indicatorCoord && (
        <>
          {/* This Circle is the actual point per GPS fix */}
          <Circle
            pathOptions={{ color }}
            center={{
              lat: indicatorCoord.latitude,
              lng: indicatorCoord.longitude,
            }}
            fillColor={color}
            fillOpacity={1}
            color={color}
            // Sets the center dot radius of latest fix on hover
            radius={60}
            eventHandlers={{
              mouseover: handleTTVisible,
              mouseout: handleTTHidden,
            }}
          >
            {tooltipVisible && (
              <Tooltip direction="right" offset={[10, 0]} opacity={0.9}>
                <span>
                  <div className="text-purple text-bold">
                    {name} <br />
                  </div>
                  Latest position: {indicatorCoord.latitude.toFixed(5)},{' '}
                  {indicatorCoord.longitude.toFixed(5)}
                  <br />
                  {indicatorCoord.isoTime.split('T')[0] +
                    ' ' +
                    indicatorCoord.isoTime.split('T')[1].split('Z')[0]}
                  {' - '}
                  {timeSinceFixDisplay}
                </span>
              </Tooltip>
            )}
          </Circle>
        </>
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
      {mapHoverCoord && (
        <Circle
          center={{ lat: mapHoverCoord[0], lng: mapHoverCoord[1] }}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 2,
          }}
          radius={60}
        />
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
      {/* Invisible hit targets — map hover syncs the timeline indicator
          position (indicatorTime) without triggering track dimming (dimTime). */}
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
          eventHandlers={{
            mouseover: handleCoord,
            mouseout: handleMouseOut,
          }}
        />
      ))}
    </>
  ) : null
}

export default VehiclePath
