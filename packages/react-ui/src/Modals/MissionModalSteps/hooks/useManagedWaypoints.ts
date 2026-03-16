import { atom, useRecoilState } from 'recoil'
import { useRef, useEffect, useCallback } from 'react'
import { roundCoord } from '@mbari/utils'
import {
  WaypointProps,
  WaypointTableProps,
} from '../../../Tables/WaypointTable'

const WAYPOINT_COORD_DECIMALS = 5

function normalizeWaypointCoord(value: string | undefined): string {
  const trimmed = (value ?? '').trim()
  if (trimmed === '') return ''
  if (trimmed.toLowerCase() === 'nan') return 'NaN'
  const num = parseFloat(trimmed)
  if (!Number.isFinite(num)) return ''
  return roundCoord(num, WAYPOINT_COORD_DECIMALS).toString()
}

export interface UseManagedWaypointsState {
  waypoints?: WaypointProps[]
  editable?: boolean
  focusedWaypointIndex?: number | null
}

const managedWaypoints = atom<UseManagedWaypointsState | null>({
  key: 'managedWaypoints',
  default: null,
})

const useManagedWaypoints = (waypoints: WaypointProps[] = []) => {
  const defaultWaypoints = useRef<string>(JSON.stringify(waypoints))

  const [updatedWaypoints, setUpdatedWaypoints] =
    useRecoilState(managedWaypoints)

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

  // Update waypoints via user input. Normalizes lat/lon to fixed decimal places.
  const handleWaypointsUpdate = useCallback(
    (newWaypoints: WaypointProps[]) => {
      const normalized = newWaypoints.map((wp) => ({
        ...wp,
        lat: normalizeWaypointCoord(wp.lat),
        lon: normalizeWaypointCoord(wp.lon),
      }))
      setUpdatedWaypoints({ ...updatedWaypoints, waypoints: normalized })
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
  const plottedWaypoints = (updatedWaypoints?.waypoints ?? waypoints).filter(
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
