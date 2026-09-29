import React, { useEffect, useCallback } from 'react'
import { faRoute } from '@fortawesome/free-solid-svg-icons'
import { TreeItem } from './MapLayersTreeItem'
import {
  CONDITIONAL_LEAVES,
  LRAUVS_ROOT_HOVER,
  ORDERED_LEAF_KEYS,
  VehicleLeafKey,
  useSelectedLrauvs,
} from './SelectedLrauvsContext'
import { useMapCamera } from './MapCameraContext'

interface LrauvsLayerSectionProps {
  vehicleNames: string[]
  filteredVehicleNames: string[]
  isFiltering: boolean
  expandedSections: Record<string, boolean>
  toggleExpanded: (section: string) => void
}

/** Max GPS fix dots shown on the map; matches the hover and label cap. */
export const GPS_FIXES_DISPLAY_CAP = 20

const LEAF_LABELS: Record<VehicleLeafKey, string> = {
  gpsFixes: 'GPS fixes',
  waypoints: 'Waypoints',
  argos: 'Argos',
  navigatingToWaypoints: 'Navigating to WPs',
  reachedWaypoints: 'Reached WPs',
  emergencies: 'Emergencies',
}

export const LrauvsLayerSection: React.FC<LrauvsLayerSectionProps> = ({
  vehicleNames,
  filteredVehicleNames,
  isFiltering,
  expandedSections,
  toggleExpanded,
}) => {
  const {
    isLeafChecked,
    toggleLeaf,
    toggleVehicle,
    toggleAll,
    vehicleCounts,
    setHover,
    clearHover,
    getVehicleLeafPositions,
  } = useSelectedLrauvs()

  const { setFlyToRequest } = useMapCamera()

  // Clear hover state when this section unmounts (e.g. modal closed) so
  // yellow highlight overlays don't persist on the map after dismissal.
  useEffect(() => {
    return () => {
      clearHover()
    }
  }, [clearHover])

  /** Compute a Leaflet LatLngBounds tuple from an array of [lat, lon] pairs. */
  const computeBounds = useCallback(
    (pts: [number, number][]): [[number, number], [number, number]] | null => {
      if (pts.length === 0) return null
      let minLat = Infinity,
        maxLat = -Infinity,
        minLon = Infinity,
        maxLon = -Infinity
      for (const [lat, lon] of pts) {
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lon < minLon) minLon = lon
        if (lon > maxLon) maxLon = lon
      }
      // Expand a single-point bound so fitBounds has something to work with
      if (minLat === maxLat && minLon === maxLon) {
        return [
          [minLat - 0.01, minLon - 0.01],
          [maxLat + 0.01, maxLon + 0.01],
        ]
      }
      return [
        [minLat, minLon],
        [maxLat, maxLon],
      ]
    },
    []
  )

  const handleCenterLeaf = useCallback(
    (vehicleName: string, leaf: VehicleLeafKey) => {
      const positions = getVehicleLeafPositions(vehicleName)
      const raw = positions?.[leaf] ?? []
      // GPS fixes are capped at GPS_FIXES_DISPLAY_CAP on the map.
      // Waypoints: the registered array is [latestPosition, ...points],
      // and the hover shows latestPosition + up to 20 planned points (21 total).
      const pts =
        leaf === 'gpsFixes'
          ? raw.slice(0, GPS_FIXES_DISPLAY_CAP)
          : leaf === 'waypoints'
          ? raw.slice(0, GPS_FIXES_DISPLAY_CAP + 1)
          : raw
      const bounds = computeBounds(pts)
      if (bounds) setFlyToRequest({ lat: 0, lon: 0, bounds })
    },
    [getVehicleLeafPositions, computeBounds, setFlyToRequest]
  )

  const handleCenterVehicle = useCallback(
    (vehicleName: string) => {
      const positions = getVehicleLeafPositions(vehicleName)
      if (!positions) return
      // Dash4 parity: only include positions from checked (visible) leaves
      const pts: [number, number][] = []
      ORDERED_LEAF_KEYS.forEach((leaf) => {
        if (isLeafChecked(vehicleName, leaf)) {
          pts.push(...(positions[leaf] ?? []))
        }
      })
      const bounds = computeBounds(pts)
      if (bounds) setFlyToRequest({ lat: 0, lon: 0, bounds })
    },
    [getVehicleLeafPositions, isLeafChecked, computeBounds, setFlyToRequest]
  )

  const handleCenterAll = useCallback(() => {
    // Dash4 parity: only include positions from checked (visible) leaves
    const pts: [number, number][] = []
    vehicleNames.forEach((vn) => {
      const positions = getVehicleLeafPositions(vn)
      if (positions) {
        ORDERED_LEAF_KEYS.forEach((leaf) => {
          if (isLeafChecked(vn, leaf)) {
            pts.push(...(positions[leaf] ?? []))
          }
        })
      }
    })
    const bounds = computeBounds(pts)
    if (bounds) setFlyToRequest({ lat: 0, lon: 0, bounds })
  }, [
    vehicleNames,
    getVehicleLeafPositions,
    isLeafChecked,
    computeBounds,
    setFlyToRequest,
  ])

  if (isFiltering && filteredVehicleNames.length === 0) return null

  const allVehiclesAllOn =
    vehicleNames.length > 0 &&
    vehicleNames.every((vn) => {
      const counts = vehicleCounts[vn]
      return ORDERED_LEAF_KEYS.filter(
        (leaf) =>
          !CONDITIONAL_LEAVES.includes(leaf) ||
          (counts?.[leaf as keyof typeof counts] ?? 0) > 0
      ).every((leaf) => isLeafChecked(vn, leaf))
    })

  const someVehicleHasAnyOn =
    vehicleNames.length > 0 &&
    vehicleNames.some((vn) => {
      const counts = vehicleCounts[vn]
      return ORDERED_LEAF_KEYS.filter(
        (leaf) =>
          !CONDITIONAL_LEAVES.includes(leaf) ||
          (counts?.[leaf as keyof typeof counts] ?? 0) > 0
      ).some((leaf) => isLeafChecked(vn, leaf))
    })

  const rootIndeterminate = someVehicleHasAnyOn && !allVehiclesAllOn

  return (
    <div onMouseLeave={clearHover}>
      <TreeItem
        label="LRAUVs"
        onRowMouseEnter={() => setHover(LRAUVS_ROOT_HOVER, null)}
        isExpanded={expandedSections.lrauvs ?? true}
        isChecked={allVehiclesAllOn}
        indeterminate={rootIndeterminate}
        onToggleExpand={() => toggleExpanded('lrauvs')}
        onToggleCheck={
          vehicleNames.length > 0 ? () => toggleAll(vehicleNames) : undefined
        }
        onCenterClick={vehicleNames.length > 0 ? handleCenterAll : undefined}
        centerLabel="Center map on all LRAUVs"
        icon={faRoute}
        iconColor="#60a5fa"
        disabled={vehicleNames.length === 0}
      >
        {filteredVehicleNames.map((vehicleName) => {
          const counts = vehicleCounts[vehicleName]
          const visibleLeaves = ORDERED_LEAF_KEYS.filter(
            (leaf) =>
              !CONDITIONAL_LEAVES.includes(leaf) ||
              (counts?.[leaf as keyof typeof counts] ?? 0) > 0
          )
          const allLeavesOn = visibleLeaves.every((leaf) =>
            isLeafChecked(vehicleName, leaf)
          )
          const someLeafOn = visibleLeaves.some((leaf) =>
            isLeafChecked(vehicleName, leaf)
          )
          const vehicleIndeterminate = someLeafOn && !allLeavesOn

          return (
            <div key={`lrauv-${vehicleName}`}>
              <TreeItem
                label={vehicleName}
                onRowMouseEnter={() => setHover(vehicleName, null)}
                isExpanded={expandedSections[`lrauv-${vehicleName}`] ?? false}
                isChecked={allLeavesOn}
                indeterminate={vehicleIndeterminate}
                onToggleExpand={() => toggleExpanded(`lrauv-${vehicleName}`)}
                onToggleCheck={() => toggleVehicle(vehicleName)}
                onCenterClick={() => handleCenterVehicle(vehicleName)}
                centerLabel={`Center map on ${vehicleName}`}
              >
                {ORDERED_LEAF_KEYS.map((leaf) => {
                  const count =
                    leaf !== 'waypoints'
                      ? counts?.[leaf as keyof typeof counts] ?? 0
                      : null

                  // Hide conditional leaves when their count is 0
                  if (CONDITIONAL_LEAVES.includes(leaf) && (count ?? 0) === 0) {
                    return null
                  }

                  // GPS fixes draw at most GPS_FIXES_DISPLAY_CAP points.
                  // When the total is larger, say so: "last 20/435".
                  // Argos, Navigating to WPs, and Reached WPs already count
                  // only the last 24 hours, so their label is that count.
                  const isCappedLeaf = leaf === 'gpsFixes'
                  const displayedCount =
                    isCappedLeaf &&
                    count !== null &&
                    count > GPS_FIXES_DISPLAY_CAP
                      ? GPS_FIXES_DISPLAY_CAP
                      : count
                  const countSuffix =
                    count !== null
                      ? displayedCount !== count
                        ? ` (${displayedCount}/${count})`
                        : ` (${count})`
                      : ''

                  const label = (
                    <>
                      {LEAF_LABELS[leaf]}
                      {isCappedLeaf && displayedCount !== count ? (
                        <>
                          {' '}
                          (<em>last</em> {displayedCount}/{count})
                        </>
                      ) : countSuffix ? (
                        countSuffix
                      ) : null}
                    </>
                  )
                  const checked = isLeafChecked(vehicleName, leaf)

                  return (
                    <div key={`lrauv-${vehicleName}-${leaf}`}>
                      <TreeItem
                        label={label}
                        onRowMouseEnter={() => setHover(vehicleName, leaf)}
                        isChecked={checked}
                        onToggleCheck={() => toggleLeaf(vehicleName, leaf)}
                        onCenterClick={
                          checked && ((count ?? 0) > 0 || leaf === 'waypoints')
                            ? () => handleCenterLeaf(vehicleName, leaf)
                            : undefined
                        }
                        centerLabel={`Center map on ${LEAF_LABELS[leaf]} for ${vehicleName}`}
                      />
                    </div>
                  )
                })}
              </TreeItem>
            </div>
          )
        })}
        {vehicleNames.length === 0 && (
          <div className="py-2 pl-10 text-sm italic text-gray-500">
            No vehicles being tracked
          </div>
        )}
      </TreeItem>
    </div>
  )
}
