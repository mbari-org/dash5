import { atom, useRecoilState } from 'recoil'
import { useRef, useEffect, useCallback } from 'react'
import { roundCoord } from '@mbari/utils'
import type { Coordinates } from '../../../types'
import {
  WaypointProps,
  WaypointTableProps,
} from '../../../Tables/WaypointTable'

const WAYPOINT_COORD_DECIMALS = 5

const normalizeWaypointCoord = (value: string | undefined): string => {
  if (value == null) return value ?? ''
  const trimmed = value.trim()

  if (trimmed.toLowerCase() === 'nan') return 'NaN'
  if (trimmed === '') return ''

  const num = parseFloat(trimmed)
  if (!Number.isFinite(num)) return value
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

  const patchManagedWaypoints = useCallback(
    (
      patchFn: (
        prev: UseManagedWaypointsState | null
      ) => Partial<UseManagedWaypointsState>
    ) =>
      setUpdatedWaypoints((prev) => ({
        ...(prev ?? {}),
        ...patchFn(prev),
      })),
    [setUpdatedWaypoints]
  )

  // Update waypoints via user input. Normalizes lat/lon to fixed decimal places.
  const handleWaypointsUpdate = useCallback(
    (newWaypoints: WaypointProps[]) => {
      const normalized = newWaypoints.map((wp) => ({
        ...wp,
        lat: normalizeWaypointCoord(wp.lat),
        lon: normalizeWaypointCoord(wp.lon),
      }))
      patchManagedWaypoints(() => ({ waypoints: normalized }))
    },
    [patchManagedWaypoints]
  )

  const setWaypointCustomPosition = useCallback(
    (index: number, coords: Coordinates) => {
      patchManagedWaypoints((prev) => {
        const currentWaypoints = prev?.waypoints ?? []

        if (index < 0 || index >= currentWaypoints.length) return {}

        const normalizedLat = roundCoord(
          coords.lat,
          WAYPOINT_COORD_DECIMALS
        ).toString()
        const normalizedLon = roundCoord(
          coords.lon,
          WAYPOINT_COORD_DECIMALS
        ).toString()

        return {
          waypoints: currentWaypoints.map((waypoint, i) =>
            i === index
              ? {
                  ...waypoint,
                  lat: normalizedLat,
                  lon: normalizedLon,
                  stationName: 'Custom',
                }
              : waypoint
          ),
        }
      })
    },
    [patchManagedWaypoints]
  )

  const clearWaypoint = useCallback(
    (index: number) => {
      patchManagedWaypoints((prev) => {
        const currentWaypoints = prev?.waypoints ?? []

        if (index < 0 || index >= currentWaypoints.length) return {}

        return {
          waypoints: currentWaypoints.map((waypoint, i) =>
            i === index
              ? { ...waypoint, lat: 'NaN', lon: 'NaN', stationName: 'Custom' }
              : waypoint
          ),
        }
      })
    },
    [patchManagedWaypoints]
  )

  // Clear all waypoints
  const handleNaNwaypoints = useCallback(() => {
    patchManagedWaypoints((prev) => {
      const currentWaypoints = prev?.waypoints ?? []
      return {
        waypoints: currentWaypoints.map((waypoint) => ({
          ...waypoint,
          lat: 'NaN',
          lon: 'NaN',
          stationName: 'Custom',
        })),
      }
    })
  }, [patchManagedWaypoints])

  // Reset waypoints to initial state
  const handleResetWaypoints = useCallback(() => {
    patchManagedWaypoints(() => ({ waypoints: initialWaypoints }))
  }, [patchManagedWaypoints, initialWaypoints])

  // Handle focused waypoint via user input or external event.
  const handleFocusWaypoint: WaypointTableProps['onFocusWaypoint'] = (
    index
  ) => {
    patchManagedWaypoints((prev) => ({
      waypoints: prev?.waypoints ?? [],
      focusedWaypointIndex: index,
    }))
  }

  const focusWaypoint = handleFocusWaypoint

  // Determine count of waypoints with actual values.
  const plottedWaypoints = (updatedWaypoints?.waypoints ?? waypoints).filter(
    ({ lat, lon }) => lat !== 'NaN' || lon !== 'NaN'
  )
  const plottedWaypointCount = plottedWaypoints.length ?? 0

  const setWaypointsEditable = (editable: boolean) => {
    patchManagedWaypoints(() => ({ editable }))
  }

  return {
    handleNaNwaypoints,
    handleResetWaypoints,
    handleWaypointsUpdate,
    setWaypointCustomPosition,
    clearWaypoint,
    setWaypointsEditable,
    editable: updatedWaypoints?.editable,
    updatedWaypoints: updatedWaypoints?.waypoints ?? [],
    plottedWaypoints,
    plottedWaypointCount,
    handleFocusWaypoint,
    focusWaypoint,
    focusedWaypointIndex: updatedWaypoints?.focusedWaypointIndex,
  }
}

export default useManagedWaypoints
