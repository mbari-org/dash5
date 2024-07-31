import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { DateTime } from 'luxon'
import {
  useVehiclePos,
  useVehicles,
  useLastDeployment,
  VPosDetail,
} from '@mbari/api-client'
import { Polyline, useMap, Circle, Tooltip } from 'react-leaflet'
import {
  LatLng,
  LeafletMouseEventHandlerFn,
  Popup,
  circle,
  icon,
} from 'leaflet'
import { useSharedPath } from './SharedPathContextProvider'
import { distance } from '@turf/turf'
import { parseISO, getTime } from 'date-fns'

let timeSinceFix
let hours: number, minutes: number

const getDistance = (a: VPosDetail, b: LatLng) =>
  distance([a.latitude, a.longitude], [b.lat, b.lng])

const VehiclePath: React.FC<{
  name: string
  grouped?: boolean
  from?: number
  to?: number
  indicatorTime?: number | null
  onScrub?: (millis?: number | null) => void
  onGPSFix?: (gps: VPosDetail) => void
}> = ({
  name,
  grouped,
  to,
  from,
  indicatorTime,
  onScrub: handleScrub,
  onGPSFix: handleGPSFix,
}) => {
  const map = useMap()
  const { sharedPath, dispatch } = useSharedPath()
  const { data: vehicleData } = useVehicles({})
  const { data: lastDeployment } = useLastDeployment(
    {
      vehicle: name,
      to: new Date().toISOString(),
    },
    { staleTime: 5 * 60 * 1000 }
  )
  const { data: vehiclePosition } = useVehiclePos(
    {
      vehicle: name as string,
      from: DateTime.fromMillis(
        from ?? lastDeployment?.startEvent?.unixTime ?? 0
      ).toISO(),
      to: to?.toString(),
    },
    {
      enabled: !!from || !!lastDeployment?.startEvent?.unixTime,
    }
  )

  const latestGPS = useRef<[number, number] | undefined>()
  useEffect(() => {
    if (vehiclePosition?.gpsFixes) {
      const latest = vehiclePosition.gpsFixes[0]
      if (
        latestGPS.current &&
        latestGPS.current[0] === latest.longitude &&
        latestGPS.current[1] === latest.longitude
      ) {
        return
      }
      latestGPS.current = [latest.latitude, latest.longitude]
      handleGPSFix?.(latest)
    }
  }, [vehiclePosition, handleScrub, handleGPSFix])

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // handleCoord
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
    ].map((g) => [g?.latitude ?? 0, g?.longitude ?? 0] as [number, number])
  // fit
  const fit = useRef<string | null | undefined>(null)
  // routeAsString
  const routeAsString = route?.flat().join()

  // Fit bounds for Deployment Map
  useEffect(() => {
    if (fit.current !== routeAsString && route) {
      if (!grouped) {
        dispatch({ type: 'clear' })
        if (route?.length) {
          map.fitBounds(route)
        }
      } else {
        dispatch({ type: 'append', coords: { [name]: route } })
      }
      fit.current = routeAsString
    }
  }, [route, map, dispatch, name, grouped, routeAsString])

  // OVERVIEW MAP
  // Fit bounds for OverViewMap
  useEffect(() => {
    const coords = Object.values(sharedPath).flat()
    if (grouped && coords.length > 1) {
      map.fitBounds(coords)
    }
  }, [sharedPath, grouped, map])

  // This would be stored as state via useCookie library.
  // Path Stylization
  const customColors: { [key: string]: string | null } = {
    Ahi: '#FF0000',
    daphne: '#FFA500',
    pontus: '#FFFF00',
  }

  const color =
    customColors[name] ??
    vehicleData?.find((v) => v.vehicleName === name)?.color ??
    '#ccc'

  const [lineStyle, setLineStyle] = useState({
    color,
    weight: 3,
  })

  // Determine Time Difference since last gpsFix
  const latest = vehiclePosition?.gpsFixes?.[0]
  // IsoTime as a string
  const latestTimeFix = latest?.isoTime.toString()
  let [timeSinceFix, setTimeSinceFix] = useState('')

  if (latestTimeFix) {
    const parsedDate = parseISO(latestTimeFix)
    const epochMSeconds = getTime(parsedDate)

    if (epochMSeconds) {
      const timeDiff = (Date.now() - epochMSeconds) / 60000
      convertMin2HrMin(timeDiff)
    }
  }

  return route ? (
    <>
      <Polyline
        pathOptions={lineStyle}
        positions={activeRoute ?? route}
        eventHandlers={{
          mouseover: () => {
            setLineStyle({ color, weight: 5 })
          },
          mouseout: () => {
            setLineStyle({ color, weight: 3 })
          },
        }}
      />
      {latest && (
        <>
          {/* DEPLOYMENT AND OVERVIEW PAGE */}
          {/* Circle = large dotted indicator circle. */}
          <Circle
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
      {(activeRoute ?? route).map((r) => (
        <>
          <Circle
            key={`preview${r.join()}`}
            center={{
              lat: r[0],
              lng: r[1],
            }}
            fillColor={color}
            radius={10}
            fillOpacity={1}
            color={color}
            opacity={1}
          ></Circle>
        </>
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
            key={`inactivePreview${i}${r.join()}`}
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
      {route.map((r) => (
        <Circle
          key={`touch${r.join()}`}
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
