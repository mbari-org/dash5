import { atom, useRecoilState } from 'recoil'
import { useRef, useEffect, useCallback } from 'react'
import {
  WaypointProps,
  WaypointTableProps,
} from '../../../Tables/WaypointTable'

export interface UseManagedWaypointsState {
  waypoints?: WaypointProps[]
  editable?: boolean
  focusedWaypointIndex?: number | null
}

// Cache of atoms by ID to prevent recreation
const atomCache: Record<string, any> = {}

/**
 * Get or create an atom for a specific waypoints instance
 * @param id - Unique identifier for this waypoints instance
 * @returns Recoil atom with unique key
 */
const getWaypointsAtom = (id: string = 'default') => {
  if (!atomCache[id]) {
    atomCache[id] = atom<UseManagedWaypointsState | null>({
      key: `managedWaypoints-${id}`,
      default: null,
    })
  }
  return atomCache[id]
}

/**
 * Hook for managing waypoints shared between components
 * @param waypoints - Initial waypoints array
 * @param instanceId - Optional ID when multiple instances are needed
 */
const useManagedWaypoints = (
  waypointsOrId: WaypointProps[] | string = [],
  instanceId?: string
) => {
  // Determine parameter types
  let waypoints: WaypointProps[] = []
  let id = 'default'

  if (Array.isArray(waypointsOrId)) {
    waypoints = waypointsOrId
    id = instanceId || 'default'
  } else if (typeof waypointsOrId === 'string') {
    id = waypointsOrId
  }
  const defaultWaypoints = useRef<string>(JSON.stringify(waypoints))

  // Get or create atom for this specific instance
  const managedWaypointsState = getWaypointsAtom(instanceId)

  const [updatedWaypoints, setUpdatedWaypoints] =
    useRecoilState<UseManagedWaypointsState | null>(managedWaypointsState)

  const initialWaypoints = waypoints?.map((waypoint) =>
    (waypoint.lat || waypoint.lon) && !waypoint.stationName
      ? { ...waypoint, stationName: 'Custom' }
      : waypoint
  )

  // Initialize managedWaypoints state via JSON string comparison.
  useEffect(() => {
    if (
      defaultWaypoints.current !== JSON.stringify(waypoints) ||
      updatedWaypoints?.waypoints === undefined
    ) {
      defaultWaypoints.current = JSON.stringify(waypoints)
      setUpdatedWaypoints({ waypoints: initialWaypoints ?? [] })
    }
  }, [
    waypoints,
    setUpdatedWaypoints,
    initialWaypoints,
    updatedWaypoints?.waypoints,
  ])

  // Update waypoints via user input
  const handleWaypointsUpdate = useCallback(
    (newWaypoints: WaypointProps[]) => {
      setUpdatedWaypoints({ ...updatedWaypoints, waypoints: newWaypoints })
    },
    [setUpdatedWaypoints, updatedWaypoints]
  )

  // Clear all waypoints
  const handleNaNwaypoints = useCallback(() => {
    const allNaNwaypoints =
      updatedWaypoints?.waypoints?.map((waypoint) => ({
        ...waypoint,
        lat: 'NaN',
        lon: 'NaN',
        stationName: 'Custom',
      })) ?? []
    setUpdatedWaypoints({ ...updatedWaypoints, waypoints: allNaNwaypoints })
  }, [setUpdatedWaypoints, updatedWaypoints])

  // Reset waypoints to initial state
  const handleResetWaypoints = useCallback(() => {
    setUpdatedWaypoints({ ...updatedWaypoints, waypoints: initialWaypoints })
  }, [setUpdatedWaypoints, updatedWaypoints, initialWaypoints])

  // Handle focused waypoint via user input or external event.
  const handleFocusWaypoint: WaypointTableProps['onFocusWaypoint'] = (
    index
  ) => {
    console.log('handleFocusWaypoint', index)
    setUpdatedWaypoints({
      ...updatedWaypoints,
      waypoints: updatedWaypoints?.waypoints ?? [],
      focusedWaypointIndex: index,
    })
  }

  // Determine count of waypoints with actual values.
  const plottedWaypoints = waypoints.filter(
    ({ lat, lon }) => lat !== 'NaN' || lon !== 'NaN'
  )
  const plottedWaypointCount = plottedWaypoints.length ?? 0

  const setWaypointsEditable = (editable: boolean) => {
    setUpdatedWaypoints({ ...updatedWaypoints, editable })
  }

  return {
    handleNaNwaypoints,
    handleResetWaypoints,
    handleWaypointsUpdate,
    setWaypointsEditable,
    editable: updatedWaypoints?.editable,
    updatedWaypoints: updatedWaypoints?.waypoints ?? [],
    plottedWaypoints,
    plottedWaypointCount,
    handleFocusWaypoint,
    focusedWaypointIndex: updatedWaypoints?.focusedWaypointIndex,
  }
}

export default useManagedWaypoints
