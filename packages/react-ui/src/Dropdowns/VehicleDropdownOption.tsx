import React from 'react'
import clsx from 'clsx'
import { timeSinceStart } from '@mbari/utils'

interface VehicleOptionProps {
  name: string
  status: 'deployed' | 'recovered' | 'ended'
  missionName: string
  lastEvent: string // this should be an ISO-8601 Timestamp.
}

const styles = {
  container: 'items-center text-stone-600',
}

export const VehicleDropdownOption: React.FC<VehicleOptionProps> = ({
  name,
  status,
  missionName,
  lastEvent,
}) => {
  return (
    <ul className={clsx(styles.container, 'flex w-full')}>
      <li className=" w-1/5">{name}</li>
      <li
        aria-label="status indicator icon"
        className={clsx(
          'mr-1 block p-2',
          status === 'ended' ? 'bg-red-600' : 'bg-teal-500'
        )}
      ></li>
      <li className="mr-1 opacity-60">{missionName}</li>
      <li className="opacity-60">~{timeSinceStart(lastEvent)}</li>
    </ul>
  )
}
