import React from 'react'
import clsx from 'clsx'
import { styles, VehicleProps } from '../Vehicle'

interface ThrusterProps {
  hwLight: VehicleProps['hardwareLight']
  swLight: VehicleProps['softwareLight']
  otLight: VehicleProps['otherLight']
  status: VehicleProps['status']
}

export const Thruster: React.FC<ThrusterProps> = ({
  status,
  hwLight,
  swLight,
  otLight,
}) => {
  return (
    <g>
      <circle
        aria-label="thrust"
        className={clsx(
          'stroke-black',
          status === 'onMission' ? styles.fillTeal : 'fill-white'
        )}
        cx="175.51"
        cy="261.61"
        r="8.15"
      />
      <text
        aria-label="HardwareLabel"
        textAnchor="right"
        transform="matrix(1 0 0 1 245 254)"
        className={styles.text9px}
      >
        HW
      </text>
      <text
        aria-label="SoftwareLabel"
        textAnchor="right"
        transform="matrix(1 0 0 1 245 267)"
        className={styles.text9px}
      >
        SW
      </text>
      <text
        aria-label="OtherLabel"
        textAnchor="right"
        transform="matrix(1 0 0 1 245 280)"
        className={styles.text9px}
      >
        OT
      </text>
      <circle
        aria-label="HW"
        fill="#FFFFFF"
        className={clsx(
          'stroke-black',
          hwLight ? styles.fillYellow : 'fill-white'
        )}
        cx="267"
        cy="251"
        r="4"
      />
      <circle
        aria-label="SW"
        fill="#FFFFFF"
        className={clsx(
          'stroke-black',
          swLight ? styles.fillYellow : 'fill-white'
        )}
        cx="267"
        cy="264"
        r="4"
      />
      <circle
        aria-label="OT"
        fill="#FFFFFF"
        className={clsx(
          'stroke-black',
          otLight ? styles.fillYellow : 'fill-white'
        )}
        cx="267"
        cy="277"
        r="4"
      />
      <text
        transform="matrix(1 0 0 1 193.9667 260.552)"
        className={styles.text9px}
      >
        Thruster
      </text>
      <text
        aria-label="text_speed"
        transform="matrix(1 0 0 1 198.0612 270)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        1.00m/s<title>Speed estimated from last two GPS fixes</title>
      </text>
      <text
        aria-label="speeded_label"
        transform="matrix(1 0 0 1 199 275)"
        className={clsx(styles.text6px, styles.textGray)}
      >
        command
      </text>
    </g>
  )
}
