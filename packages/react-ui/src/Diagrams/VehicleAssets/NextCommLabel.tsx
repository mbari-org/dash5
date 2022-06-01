import React from 'react'
import clsx from 'clsx'
import { VehicleProps, styles } from '../Vehicle'

export const NextCommLabel: React.FC<{
  nextComm: VehicleProps['nextComm']
}> = ({ nextComm }) => {
  return (
    <g>
      <circle
        aria-label="comm overdue status"
        className={clsx('stroke-black', styles.fillTeal)}
        cx="138.5"
        cy="295.5"
        r="2"
      />
      <text
        aria-label="text_nextcomm"
        transform="matrix(1 0 0 1 195 298.3899)"
        className={styles.text9px}
      >
        {nextComm}
      </text>
      <text
        transform="matrix(1 0 0 1 143.5453 298.3899)"
        className={styles.text9px}
      >
        NextComm:
      </text>
    </g>
  )
}
