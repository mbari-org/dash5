import clsx from 'clsx'
import React from 'react'
import { styles, VehicleProps } from '../Vehicle'

export interface CommsProps {
  satTime: VehicleProps['satTime']
  cellTime: VehicleProps['cellTime']
}
export const Comms: React.FC<CommsProps> = ({ satTime, cellTime }) => {
  return (
    <g>
      <rect
        aria-label="satcomm"
        x="261.49"
        y="182.98"
        className={clsx('stroke-black', styles.fillYellow)}
        width="24.43"
        height="11.5"
      />
      <rect
        aria-label="cellcomm"
        x="260.15"
        y="212.24"
        className={clsx('stroke-black', styles.fillYellow)}
        width="26.43"
        height="11.31"
      />
      <text
        aria-label="text_sat"
        transform="matrix(1 0 0 1 262.2478 192.1254)"
        className={styles.text9px}
      >
        {satTime}
      </text>
      <text
        aria-label="text_cell"
        transform="matrix(1 0 0 1 262.2472 221.3249)"
        className={styles.text9px}
      >
        {cellTime}
      </text>
      <text
        transform="matrix(1 0 0 1 289.4541 191.2224)"
        className={styles.text9px}
      >
        Sat comms
      </text>
      <text
        transform="matrix(1 0 0 1 291.6499 221.6039)"
        className={styles.text9px}
      >
        Cell comms
      </text>
      <text
        aria-label="text_commago"
        transform="matrix(1 0 0 1 339.0 191.2224)"
        fill="#606060"
        className={clsx(styles.text7px, styles.textGray)}
      >
        25m ago
      </text>
      <text
        aria-label="text_cellago"
        transform="matrix(1 0 0 1 342.0 221.2224)"
        fill="#606060"
        className={clsx(styles.text7px, styles.textGray)}
      >
        28m ago
      </text>
    </g>
  )
}
