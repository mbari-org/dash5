import clsx from 'clsx'
import React from 'react'
import { styles, VehicleProps } from '../Vehicle'

interface MissionProps {
  mission: VehicleProps['mission']
}

export const MissionLabel: React.FC<MissionProps> = ({ mission }) => {
  return (
    <g>
      <circle
        aria-label="mission status"
        className={styles.fillTeal}
        stroke="none"
        cx="415"
        cy="183"
        r="2"
      />
      <text transform="matrix(1 0 0 1 419.0 186)" className={styles.text9px}>
        MISSION:
      </text>
      <text
        aria-label="mission"
        transform="matrix(1 0 0 1 462.0 186)"
        className={clsx(styles.text9px, styles.textGray)}
      >
        {mission}
      </text>
    </g>
  )
}
