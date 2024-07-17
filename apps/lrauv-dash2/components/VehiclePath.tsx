import React, { useEffect, useRef, useCallback } from 'react'
import { DateTime } from 'luxon'
import {
  useVehiclePos,
  useVehicles,
  useLastDeployment,
  VPosDetail,
} from '@mbari/api-client'
import { Polyline, useMap, Circle } from 'react-leaflet'
import { LatLng, LeafletMouseEventHandlerFn } from 'leaflet'
import { useSharedPath } from './SharedPathContextProvider'
import { distance } from '@turf/turf'

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

  const handleMouseOut: LeafletMouseEventHandlerFn = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    timeout.current = setTimeout(() => {
      handleScrub?.(null)
    }, 1000)
  }, [timeout, handleScrub])

  const route = vehiclePosition?.gpsFixes?.map(
    (g) => [g.latitude, g.longitude] as [number, number]
  )
  const activePoints =
    indicatorTime && indicatorTime > 0
      ? vehiclePosition?.gpsFixes.filter(
          (fix) => fix.unixTime <= (indicatorTime ?? 0)
        )
      : null
  const activeRoute = activePoints?.map(
    (g) => [g.latitude, g.longitude] as [number, number]
  )
  const indicatorCoord = indicatorTime
    ? activePoints?.sort((a, b) => b.unixTime - a.unixTime)[0]
    : null
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

  const fit = useRef<string | null | undefined>(null)
  const routeAsString = route?.flat().join()
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

  useEffect(() => {
    const coords = Object.values(sharedPath).flat()
    if (grouped && coords.length > 1) {
      map.fitBounds(coords)
    }
  }, [sharedPath, grouped, map])

  // This would be stored as state via useCookie library.
  const customColors: { [key: string]: string | null } = {
    Ahi: '#FF0000',
    daphne: '#FFA500',
    pontus: '#FFFF00',
  }
  const color =
    customColors[name] ??
    vehicleData?.find((v) => v.vehicleName === name)?.color ??
    '#ccc'

  const latest = vehiclePosition?.gpsFixes?.[0]

  return route ? (
    <>
      <Polyline pathOptions={{ color }} positions={activeRoute ?? route} />
      {/* {latest && (
        <Circle
          center={{ lat: latest.latitude, lng: latest.longitude }}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '4, 4',
          }}
          radius={1500}
        />
      )} */}
      {indicatorCoord && (
        <Circle
          center={{
            lat: indicatorCoord.latitude,
            lng: indicatorCoord.longitude,
          }}
          fillColor={color}
          fillOpacity={1}
          color={color}
          radius={100}
        />
      )}
      {(activeRoute ?? route).map((r) => (
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
      {route.map((r) => (
        <Circle
          key={`touch${r.join()}`}
          center={{
            lat: r[0],
            lng: r[1],
          }}
          fillColor={color}
          radius={100}
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
