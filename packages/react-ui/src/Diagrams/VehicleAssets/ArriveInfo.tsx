import React from 'react'
import clsx from 'clsx'
import { styles } from '../Vehicle'

export const ArriveInfo = () => {
  return (
    <g>
      <text
        aria-label="text_arrivestation"
        transform="matrix(1 0 0 1 581 230)"
        className={styles.text7px}
      >
        Arrived at WP
      </text>
      <text
        aria-label="text_stationdist"
        transform="matrix(1 0 0 1 582 238)"
        className={clsx(styles.textGray, styles.text6px)}
      >
        15h 21m ago
      </text>
      <text
        aria-label="text_currentdist"
        transform="matrix(1 0 0 1 582 245)"
        className={clsx(styles.textGray, styles.text6px)}
      ></text>
      <text
        aria-label="arrive_label"
        transform="matrix(1 0 0 1 580 222)"
        className={clsx(styles.textGray, styles.text6px)}
      >
        Arrive Station
      </text>
    </g>
  )
}
