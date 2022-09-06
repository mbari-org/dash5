import { faSync } from '@fortawesome/pro-solid-svg-icons'
import clsx from 'clsx'
import React from 'react'
import { IconButton } from '../../Navigation/IconButton'

import {
  WaypointProps,
  WaypointTable,
  WaypointTableProps,
} from '../../Tables/WaypointTable'

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
}

const styles = {
  resetButtons: 'text-purple-500 w-fit mr-4',
  stats: 'text-stone-400 ml-4',
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
}) => {
  const waypointCount = waypoints.length ?? 0

  return (
    <article className="h-full">
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
      <WaypointTable
        className="max-h-[calc(100%-80px)]"
        waypoints={waypoints}
        stations={stations}
        onUpdate={onUpdate}
        grayHeader
      />
      <ul className="mr-4 mt-2 flex items-center justify-end">
        <li className="rounded border-2 border-stone-300/60">
          <IconButton
            icon={faSync}
            ariaLabel="refresh stats"
            size="text-2xl"
            onClick={onRefreshStats}
          />
        </li>
        <li className={styles.stats}>
          Total distance: {totalDistance ?? '---'}
        </li>
        <li className={styles.stats}>
          Est. bottom depth: {bottomDepth ?? '---'}
        </li>
        <li className={styles.stats}>Est. duration: {duration ?? '---'}</li>
      </ul>
    </article>
  )
}
