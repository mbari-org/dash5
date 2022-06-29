import React, { useEffect, useRef } from 'react'
import { DateTime } from 'luxon'
import {
  useVehiclePos,
  useVehicles,
  useLastDeployment,
} from '@mbari/api-client'
import { Polyline, useMap } from 'react-leaflet'
import { useSharedPath } from './SharedPathContextProvider'

const VehiclePath: React.FC<{
  name: string
  grouped?: boolean
  from?: number
  to?: number
}> = ({ name, grouped, to, from }) => {
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
  const route = vehiclePosition?.gpsFixes.map(
    (g) => [g.latitude, g.longitude] as [number, number]
  )

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
  const color =
    vehicleData?.find((v) => v.vehicleName === name)?.color ?? '#ccc'
  return route ? <Polyline pathOptions={{ color }} positions={route} /> : null
}

export default VehiclePath
