import clsx from 'clsx'
import React from 'react'
import { styles, VehicleProps } from '../Vehicle'

interface GroundFaultProps {
  groundFault?: VehicleProps['groundFault']
  groundFaultTime?: VehicleProps['groundFaultTime']
}

export const GroundFault: React.FC<GroundFaultProps> = ({
  groundFault,
  groundFaultTime,
}) => {
  return (
    <>
      <g>
        <title>
          Ground Fault: None means not detected. False means no recent scan
        </title>
        <line
          fill="#FFFFFF"
          className={'stroke-black'}
          strokeLinecap="round"
          x1="475.36"
          y1="256.18"
          x2="475.36"
          y2="267.72"
        />
        <line
          fill="#FFFFFF"
          className={'stroke-black'}
          strokeLinecap="round"
          x1="468.58"
          y1="268.37"
          x2="482.15"
          y2="268.37"
        />
        <line
          fill="#FFFFFF"
          className={'stroke-black'}
          strokeLinecap="round"
          x1="469.91"
          y1="270.59"
          x2="480.82"
          y2="270.59"
        />
        <line
          fill="#FFFFFF"
          className={'stroke-black'}
          strokeLinecap="round"
          x1="471.24"
          y1="272.82"
          x2="479.49"
          y2="272.82"
        />
        <line
          fill="#C6C4C4"
          className={'stroke-black'}
          strokeLinecap="round"
          x1="472.57"
          y1="275.05"
          x2="478.16"
          y2="275.05"
        />
        <rect
          aria-label="gf_rect"
          x="480"
          y="254.0"
          className={clsx('stroke-black', styles.fillTeal)}
          width="24.43"
          height="10.5"
        />
      </g>
      <g>
        <title>
          Ground Fault: None means not detected. False means no recent scan
        </title>
        <text
          transform="matrix(1 0 0 1 485 273)"
          className={clsx(styles.text7px, styles.textGray)}
        >
          GROUND
        </text>
        <text
          transform="matrix(1 0 0 1 485 281)"
          className={clsx(styles.text7px, styles.textGray)}
        >
          FAULT
        </text>
        <text
          aria-label="text_gf"
          transform="matrix(1 0 0 1 482 262.4973)"
          className={styles.text9px}
        >
          {groundFault}
        </text>
        <text
          aria-label="text_gftime"
          transform="matrix(1 0 0 1 479.3629 250)"
          className={clsx(styles.text7px, styles.textGray)}
        >
          {groundFaultTime}
        </text>
      </g>
    </>
  )
}
