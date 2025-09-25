import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  useVehiclePos,
  useLastDeployment,
  VPosDetail,
  useWaypointsInfo,
} from '@mbari/api-client'
import { Polyline, useMap, Circle, Tooltip } from 'react-leaflet'
import { LatLng, LeafletMouseEventHandlerFn } from 'leaflet'
import { useSharedPath } from './SharedPathContextProvider'
import { distance } from '@turf/turf'
import { parseISO, getTime } from 'date-fns'
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
  onScrub?: (millis?: number | null) => void
  onGPSFix?: (gps: VPosDetail) => void
  disableAutoFit?: boolean
}

// VehiclePath component
const VehiclePath: React.FC<VehiclePathProps> = ({
  name,
  grouped,
  to,
  from,
  indicatorTime,
  onScrub: handleScrub,
  onGPSFix: handleGPSFix,
  disableAutoFit = false,
}) => {
  const map = useMap()
  const { sharedPath, dispatch } = useSharedPath()

  const { data: lastDeployment } = useLastDeployment(
    {
      vehicle: name,
    },
    { staleTime: 5 * 60 * 1000, enabled: !from }
  )
  const { data: vehiclePosition } = useVehiclePos(
    {
      vehicle: name as string,
      from: from ? from : lastDeployment?.startEvent?.unixTime ?? 0,
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

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // handleCoordinates
  const handleCoord: LeafletMouseEventHandlerFn = useCallback(
    (e) => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
      const coord = [...(vehiclePosition?.gpsFixes ?? [])].sort(
        (a, b) => getDistance(a, e.latlng) - getDistance(b, e.latlng)
      )[0]
      handleScrub?.(coord?.unixTime)
    },
    [timeout, handleScrub, vehiclePosition?.gpsFixes]
  )

  // handleMouseOut
  const handleMouseOut: LeafletMouseEventHandlerFn = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    timeout.current = setTimeout(() => {
      handleScrub?.(null)
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

  // DEPLOYMENT MAP
  // activePoints - Deployment Map
  const activePoints =
    indicatorTime && indicatorTime > 0
      ? vehiclePosition?.gpsFixes.filter(
          (fix) => fix.unixTime <= (indicatorTime ?? 0)
        )
      : null

  // activeRoute
  const activeRoute = activePoints?.map(
    (g) => [g.latitude, g.longitude] as [number, number]
  )

  // indicatorCoord - Deployment Map
  const indicatorCoord = indicatorTime
    ? activePoints?.sort((a, b) => b.unixTime - a.unixTime)[0]
    : null

  // inactiveRoute - Deployment Map
  const inactiveRoute =
    indicatorTime &&
    [
      indicatorCoord,
      ...(
        vehiclePosition?.gpsFixes.filter(
          (fix) => fix.unixTime >= (indicatorTime ?? 0)
        ) ?? []
      ).sort((a, b) => a.unixTime - b.unixTime),
    ]
      ?.filter((g) => g && g.latitude != null && g.longitude != null)
      .map((g) => [g?.latitude ?? 0, g?.longitude ?? 0] as [number, number])
  // fit
  const fit = useRef<string | null | undefined>(null)
  // routeAsString
  const routeAsString = route?.flat().join()

  // Fit bounds for Deployment Map
  useEffect(() => {
    //  Disable map auto-fit centering when the user interacts with timeline.
    if (fit.current !== routeAsString && route && !disableAutoFit) {
      if (!grouped) {
        dispatch({ type: 'clear' })
        if (route?.length) {
          map.fitBounds(route, {
            paddingBottomRight: [0, 320], // Add bottom padding to deployment map to show path above the vehicle diagram
          })
        }
      } else {
        dispatch({ type: 'append', coords: { [name]: route } })
      }
      fit.current = routeAsString
    }
  }, [route, map, dispatch, name, grouped, routeAsString, disableAutoFit])

  // OVERVIEW MAP
  // Fit bounds for OverViewMap
  useEffect(() => {
    const coords = Object.values(sharedPath).flat()
    if (grouped && coords.length > 1) {
      map.fitBounds(coords)
    }
  }, [sharedPath, grouped, map])

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

  return route?.length ? (
    <>
      <Polyline
        pathOptions={lineStyle}
        positions={route}
        // positions={activeRoute ?? route}
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
                  {timeSinceFix}
                </span>
              </Tooltip>
            )}
          </Circle>
        </>
      )}
      {(activeRoute ?? route).map((r, i) => (
        <VehiclePoint
          key={`${name}:${
            grouped ? 'overview' : 'detail'
          }:preview:${i}:${r.join()}`}
          position={r}
          color={color}
          radius={10}
        />
      ))}
      {inactiveRoute && (
        <Polyline
          pathOptions={{ color, opacity: 0.35 }}
          positions={inactiveRoute}
        />
      )}
      {inactiveRoute &&
        inactiveRoute?.map((r, i) => (
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
            fillOpacity={0.25}
            color={color}
            opacity={0.25}
          />
        ))}
      {/* This handles the Scrub Timeline route */}
      {route.map((r, index) => (
        <Circle
          key={`${name}:${
            grouped ? 'overview' : 'detail'
          }:touch:${index}:${r.join()}`}
          center={{
            lat: r[0],
            lng: r[1],
          }}
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
