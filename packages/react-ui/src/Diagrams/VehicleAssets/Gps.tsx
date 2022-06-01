import React from 'react'
import clsx from 'clsx'
import { VehicleProps, styles } from '../Vehicle'

export const Gps: React.FC<{ time: VehicleProps['gpsTime'] }> = ({ time }) => {
  return (
    <g>
      <rect
        aria-label="gps"
        x="407.76"
        y="221.71"
        className={clsx('stroke-black', styles.fillTeal)}
        width="26.93"
        height="10.17"
      />
      <text
        transform="matrix(1 0 0 1 439.3514 226.8654)"
        className={styles.text9px}
      >
        Last GPS
      </text>
      <text
        aria-label="text_gpsago"
        transform="matrix(1 0 0 1 481 226.5)"
        className={clsx(styles.textGray, styles.text7px)}
      >
        28m ago
      </text>
      <text
        aria-label="text_gps"
        transform="matrix(1 0 0 1 410.1005 229.6799)"
        className={styles.text9px}
      >
        {time}
      </text>
    </g>
  )
}
