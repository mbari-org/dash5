import React from 'react'
import clsx from 'clsx'
import { styles, VehicleProps } from '../Vehicle'

export const DvlIndicator: React.FC<{ dvl: VehicleProps['dvl'] }> = ({
  dvl,
}) => {
  return (
    <>
      <polygon
        aria-label="dvl"
        className={clsx(
          'stroke-black',
          dvl ? styles.fillTeal : styles.fillYellow
        )}
        points="541.91,287.26 553.41,287.26 558.97,295.79 541.52,295.79 "
      />
      <text
        aria-label="text_dvlstatus"
        transform="matrix(1 0 0 1 542 304)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        {dvl ? 'ON' : 'OFF'}
      </text>
      <text
        transform="matrix(1 0 0 1 540.0956 283.4494)"
        className={styles.text9px}
      >
        DVL
      </text>
    </>
  )
}
