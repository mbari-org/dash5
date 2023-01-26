import clsx from 'clsx'
import React from 'react'

import {
  WaypointProps,
  WaypointTable,
  WaypointTableProps,
} from '../../Tables/WaypointTable'
import { StatDisplay } from './StatDisplay'

export interface WaypointStepProps extends WaypointTableProps {
  vehicleName: string
  mission: string
  totalDistance?: string
  bottomDepth?: string
  duration?: string
  onRefreshStats?: () => void
  onUpdate?: (updatedWaypoints: WaypointProps[]) => void
  onNaNall: () => void
  onResetAll: () => void
  focusedWaypointIndex?: number | null
}

const styles = {
  resetButtons: 'text-purple-500 w-fit mr-4',
}

export const WaypointStep: React.FC<WaypointStepProps> = ({
  vehicleName,
  mission,
  totalDistance,
  bottomDepth,
  duration,
  waypoints,
  stations,
  onRefreshStats,
  onUpdate,
  onNaNall,
  onResetAll,
  onFocusWaypoint,
  focusedWaypointIndex,
}) => {
  const waypointCount = waypoints.length ?? 0
  const handleClearFocus = () => onFocusWaypoint?.(null)

  return (
    <article className="h-full">
      {!focusedWaypointIndex ? (
        <ul className="mx-4 flex pb-2">
          <li className="flex-grow self-center">
            Set up to {waypointCount} waypoint{waypointCount !== 1 && 's'} for{' '}
            {vehicleName}&apos;s{' '}
            <span className="text-teal-500" data-testid="mission name">
              {mission}
            </span>{' '}
            mission
          </li>
          <li className="flex items-center">
            <button className={clsx(styles.resetButtons)} onClick={onNaNall}>
              NaN all
            </button>

            <button className={clsx(styles.resetButtons)} onClick={onResetAll}>
              Reset all
            </button>
          </li>
        </ul>
      ) : null}
      <WaypointTable
        className="max-h-[calc(100%-20px)]"
        waypoints={waypoints}
        stations={stations}
        onUpdate={onUpdate}
        onFocusWaypoint={onFocusWaypoint}
        onDone={handleClearFocus}
        focusedWaypointIndex={focusedWaypointIndex}
        grayHeader
      />
      <StatDisplay
        totalDistance={totalDistance}
        bottomDepth={bottomDepth}
        duration={duration}
        onRefreshStats={onRefreshStats}
      />
    </article>
  )
}
