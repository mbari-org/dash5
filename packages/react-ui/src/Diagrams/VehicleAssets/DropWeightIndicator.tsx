import React from 'react'
import clsx from 'clsx'
import { styles, VehicleProps } from '../Vehicle'

interface DropWeightProps {
  dropWeight: VehicleProps['dropWeight']
  dropTime: VehicleProps['dropTime']
}
export const DropWeightIndicator: React.FC<DropWeightProps> = ({
  dropWeight,
  dropTime,
}) => {
  return (
    <>
      <rect
        aria-label="drop"
        x="284.79"
        y="282.44"
        className={clsx(
          'stroke-black',
          dropWeight ? styles.fillTeal : styles.fillOrange
        )}
        width="24.43"
        height="9.5"
      />
      <text
        transform="matrix(1 0 0 1 285 300)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        DROP WEIGHT
      </text>
      {dropTime && (
        <text
          aria-label="text_droptime"
          transform="matrix(1 0 0 1 338 300)"
          className={clsx(styles.text7px, styles.textGray)}
        >
          {dropTime}
        </text>
      )}
    </>
  )
}
