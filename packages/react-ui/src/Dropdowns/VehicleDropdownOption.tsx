import React from 'react'
import clsx from 'clsx'
import { timeSinceStart } from '@mbari/utils'

interface VehicleOptionProps {
  name: string
  status: 'deployed' | 'ended'
  missionName?: string
  lastEvent?: string // this should be an ISO-8601 Timestamp.
}

const styles = {
  container: 'items-center text-stone-600 text-sm',
}

export const VehicleDropdownOption: React.FC<VehicleOptionProps> = ({
  name,
  status,
  missionName,
  lastEvent,
}) => {
  return (
    <ul className={clsx(styles.container, 'flex w-full')}>
      <li className=" w-1/5" aria-label={`select vehicle ${name}`}>
        {name}
      </li>
      <li
        aria-label="status indicator icon"
        className={clsx(
          'my-auto mr-2 h-3 w-3 p-1',
          status === 'ended' && 'bg-red-600',
          status === 'deployed' && 'bg-teal-500',
          !missionName && 'bg-stone-500'
        )}
      ></li>
      <li className="mr-1 opacity-60">
        {missionName ?? <span>No Deployment</span>}
      </li>
      {lastEvent && (
        <li className="opacity-60">~{timeSinceStart(lastEvent)}</li>
      )}
    </ul>
  )
}
