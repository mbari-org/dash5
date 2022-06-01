import React from 'react'
import clsx from 'clsx'
import { styles, VehicleProps } from '../Vehicle'

export interface BatteryProps {
  volts: VehicleProps['batteryVolts']
  amps: VehicleProps['batteryAmps']
  ampTime: VehicleProps['batteryAmpTime']
}
export const Batteries: React.FC<BatteryProps> = ({
  volts = 0,
  amps = 0,
  ampTime,
}) => {
  const roundedVolts = Math.round(volts * 2) / 2

  return (
    <g>
      <title>Batteries in 0.5 increment from 13.5 to 16.5</title>
      <circle
        aria-label="bat1"
        className={clsx(
          'stroke-black',
          roundedVolts >= 13.5 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="309"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat2"
        className={clsx(
          'stroke-black',
          roundedVolts >= 14 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="319"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat3"
        className={clsx(
          'stroke-black',
          roundedVolts >= 14.5 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="329"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat4"
        className={clsx(
          'stroke-black',
          roundedVolts >= 15 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="339"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat5"
        className={clsx(
          'stroke-black',
          roundedVolts >= 15.5 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="349"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat6"
        className={clsx(
          'stroke-black',
          roundedVolts >= 16 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="359"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat7"
        className={clsx(
          'stroke-black',
          roundedVolts >= 16.5 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="369"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat8"
        className={clsx(
          'stroke-black',
          roundedVolts >= 17 ? styles.fillTeal : styles.fillDarkGray
        )}
        cx="379"
        cy="241.38"
        r="4"
      />
      <rect
        aria-label="amps"
        x="336.28"
        y="261.76"
        className={clsx(
          'stroke-black',
          roundedVolts > 15 ? styles.fillTeal : styles.fillYellow
        )}
        width="25.5"
        height="10.5"
      />
      <rect
        aria-label="volts"
        x="336.28"
        y="249.85"
        className={clsx(
          'stroke-black',
          roundedVolts > 15 ? styles.fillTeal : styles.fillYellow
        )}
        width="25.5"
        height="10.5"
      />
      <text
        aria-label="text_volts"
        transform="matrix(1 0 0 1 338.0 257.9931)"
        className={styles.text9px}
      >
        {volts?.toFixed(1)}
      </text>
      <text
        aria-label="text_amps"
        transform="matrix(1 0 0 1 338.0 270.4917)"
        className={styles.text9px}
      >
        {amps?.toFixed(1)}
      </text>
      <text
        aria-label="text_ampago"
        transform="matrix(1 0 0 1 330.0 280.0)"
        className={clsx(styles.text7px, styles.textGray)}
      >
        {ampTime}
      </text>
      <text
        transform="matrix(1 0 0 1 308.64 258.2642)"
        className={styles.text9px}
      >
        Volts:
      </text>
      <text
        transform="matrix(1 0 0 1 304.7791 270.4165)"
        className={styles.text9px}
      >
        AmpH:
      </text>
    </g>
  )
}
