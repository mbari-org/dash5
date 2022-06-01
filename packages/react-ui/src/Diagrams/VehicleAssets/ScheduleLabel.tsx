import React from 'react'
import clsx from 'clsx'
import { VehicleProps, styles } from '../Vehicle'

export const ScheduleLabel: React.FC<{
  scheduled: VehicleProps['scheduled']
}> = ({ scheduled }) => {
  return (
    <g>
      <circle
        aria-label="schedule status"
        className={styles.fillTeal}
        stroke="none"
        cx="415"
        cy="193.5"
        r="1.6"
      />
      <text
        aria-label="mission schedule"
        transform="matrix(1 0 0 1 419.5 196)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        SCHEDULED: {scheduled}
      </text>
    </g>
  )
}
