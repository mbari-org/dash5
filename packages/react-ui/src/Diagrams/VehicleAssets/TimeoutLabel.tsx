import React from 'react'
import clsx from 'clsx'
import { VehicleProps, styles } from '../Vehicle'

export const TimeoutLabel: React.FC<{ timeout: VehicleProps['timeout'] }> = ({
  timeout,
}) => {
  return (
    <g>
      <circle
        aria-label="missionoverdue"
        className={clsx('stroke-black', styles.fillTeal)}
        cx="138.5"
        cy="306"
        r="2"
      />
      <text
        aria-label="text_timeout"
        transform="matrix(1 0 0 1 195 309.1899)"
        className={styles.text9px}
      >
        {timeout}
      </text>
      <text
        transform="matrix(1 0 0 1 143.0 309.1899)"
        className={styles.text9px}
      >
        Timeout:{' '}
      </text>
    </g>
  )
}
