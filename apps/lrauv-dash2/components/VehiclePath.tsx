import React, { useEffect, useRef } from 'react'
import { DateTime } from 'luxon'
import {
  useVehiclePos,
  useVehicles,
  useLastDeployment,
} from '@mbari/api-client'
import { Polyline, useMap } from 'react-leaflet'
import { useSharedPath } from './SharedPathContextProvider'

const VehiclePath: React.FC<{ name: string; grouped?: boolean }> = ({
  name,
  grouped,
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
        lastDeployment?.startEvent?.unixTime ?? 0
      ).toISO(),
    },
    {
      enabled: !!lastDeployment?.startEvent?.unixTime,
    }
  )
  const route = vehiclePosition?.gpsFixes.map(
    (g) => [g.latitude, g.longitude] as [number, number]
  )

  const fit = useRef<string | null>(null)
  useEffect(() => {
    if (fit.current !== name && route) {
      if (!grouped) {
        dispatch({ type: 'clear' })
        map.fitBounds(route)
      } else {
        dispatch({ type: 'append', coords: { [name]: route } })
      }
      fit.current = name
    }
  }, [route, map, dispatch, name, grouped])
  useEffect(() => {
    const coords = Object.values(sharedPath).flat()
    if (grouped && coords.length > 1) {
      map.fitBounds(coords)
    }
  }, [sharedPath, grouped, map])
  const color =
    vehicleData?.find((v) => v.vehicleName === name)?.color ?? '#ccc'
  return route ? <Polyline pathOptions={{ color }} positions={route} /> : null
}

export default VehiclePath
