import { useState, useEffect } from 'react'
import {
  WaypointProps,
  WaypointTableProps,
} from '../../../Tables/WaypointTable'

const useManagedWaypoints = (waypoints: WaypointProps[]) => {
  const [defaultWaypoints, setDefaultWaypoints] = useState<string>(
    JSON.stringify(waypoints)
  )
  const [updatedWaypoints, setUpdatedWaypoints] =
    useState<WaypointProps[]>(waypoints)
  const initialWaypoints = waypoints.map((waypoint) =>
    (waypoint.lat || waypoint.lon) && !waypoint.stationName
      ? { ...waypoint, stationName: 'Custom' }
      : waypoint
  )
  useEffect(() => {
    if (defaultWaypoints !== JSON.stringify(waypoints)) {
      setDefaultWaypoints(JSON.stringify(waypoints))
      setUpdatedWaypoints(initialWaypoints)
    }
  }, [waypoints, defaultWaypoints, setDefaultWaypoints, setUpdatedWaypoints])

  const handleWaypointsUpdate = (newWaypoints: WaypointProps[]) => {
    setUpdatedWaypoints(newWaypoints)
  }

  const handleNaNwaypoints = () => {
    const allNaNwaypoints = updatedWaypoints.map((waypoint) => ({
      ...waypoint,
      lat: 'NaN',
      lon: 'NaN',
      stationName: 'Custom',
    }))
    setUpdatedWaypoints(allNaNwaypoints)
  }
  const handleResetWaypoints = () => {
    setUpdatedWaypoints(initialWaypoints)
  }

  const [focusedWaypointIndex, setFocusedWaypointIndex] = useState<
    number | null
  >(null)
  const handleFocusWaypoint: WaypointTableProps['onFocusWaypoint'] = (
    index
  ) => {
    setFocusedWaypointIndex(index)
  }

  const plottedWaypoints = waypoints.filter(
    ({ lat, lon }) => lat !== 'NaN' || lon !== 'NaN'
  )

  const plottedWaypointCount = plottedWaypoints.length ?? 0

  return {
    handleNaNwaypoints,
    handleResetWaypoints,
    handleWaypointsUpdate,
    updatedWaypoints,
    plottedWaypoints,
    plottedWaypointCount,
    handleFocusWaypoint,
    focusedWaypointIndex,
  }
}

export default useManagedWaypoints
