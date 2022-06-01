import clsx from 'clsx'
import React from 'react'
import { styles, VehicleProps } from '../Vehicle'

export interface VehicleInfoProps {
  name: VehicleProps['name']
  updated: VehicleProps['updated']
}
export const VehicleInfo: React.FC<VehicleInfoProps> = ({ name, updated }) => {
  return (
    <g>
      <text
        aria-label="text_vehicle"
        transform="matrix(1 0 0 1 400 254.7336)"
        className={styles.text11px}
      >
        {name}
      </text>

      <text
        aria-label="text_lastupdate"
        transform="matrix(1 0 0 1 406.0 280.0)"
        className={styles.text11px}
      >
        {updated}
      </text>
      <text
        transform="matrix(1 0 0 1 404.0 268.0)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        UPDATED:
      </text>
    </g>
  )
}
