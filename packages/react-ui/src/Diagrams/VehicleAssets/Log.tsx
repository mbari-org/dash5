import React from 'react'
import clsx from 'clsx'
import { styles, VehicleProps } from '../Vehicle'

export const Log: React.FC<{ startTime: VehicleProps['logStartTime'] }> = ({
  startTime,
}) => {
  return (
    <g>
      <text
        aria-label="text_logtime"
        transform="matrix(1 0 0 1 185.0 221.6039)"
        className={styles.text9px}
      >
        {startTime}
      </text>
      <text
        aria-label="text_logago"
        transform="matrix(1 0 0 1 185.0 231.2224)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        3h 35m ago
      </text>
      <text
        transform="matrix(1 0 0 1 144.0 221.6039)"
        className={styles.text9px}
      >
        Log start:
      </text>
    </g>
  )
}
