import React from 'react'
import clsx from 'clsx'
import { VehicleProps, styles } from '../Vehicle'

export const Heading: React.FC<{
  headingDegrees: VehicleProps['headingDegrees']
}> = ({ headingDegrees }) => {
  return (
    <>
      <g
        aria-label="arrow"
        transform={`rotate (-90,604.94,259.74), rotate(${
          headingDegrees ? headingDegrees : '90'
        },605,259.74)`}
      >
        <rect x="594.14" y="256.24" fill="#A2A0A0" width="11.73" height="7" />
        <g>
          <polygon
            fill="#A2A0A0"
            points="618.22,259.74 600.81,266.86 604.94,259.74 600.81,252.63"
          />
        </g>
      </g>
      <text
        aria-label="text_bearing"
        transform="matrix(1 0 0 1 596 262.3)"
        className={styles.text7px}
      >
        {headingDegrees && `${headingDegrees}°`}
      </text>
      <text
        aria-label="text_thrusttime"
        transform="matrix(1 0 0 1 592 276.3205)"
        className={styles.text9px}
      >
        0.5km/hr
      </text>
      <text
        aria-label="reckoned_detail"
        transform="matrix(1 0 0 1 592 294)"
        className={clsx(styles.textGray, styles.text6px)}
      >
        1.4km in 2.7h
      </text>
      <text
        aria-label="reckoned_label"
        transform="matrix(1 0 0 1 592 287)"
        className={clsx(styles.textGray, styles.text6px)}
      >
        reckoned<title>Speed estimated from last two GPS fixes</title>
      </text>
    </>
  )
}
