import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface BatteryProps {
  colorBat1?: VehicleProps['colorBat1']
  colorBat2?: VehicleProps['colorBat2']
  colorBat3?: VehicleProps['colorBat3']
  colorBat4?: VehicleProps['colorBat4']
  colorBat5?: VehicleProps['colorBat5']
  colorBat6?: VehicleProps['colorBat6']
  colorBat7?: VehicleProps['colorBat7']
  colorBat8?: VehicleProps['colorBat8']
  textVolts?: VehicleProps['textVolts']
  textAmps?: VehicleProps['textAmps']
  textAmpAgo?: VehicleProps['textAmpAgo']
  colorVolts?: VehicleProps['colorVolts']
  colorAmps?: VehicleProps['colorAmps']
  isDocked?: boolean
}
export const Batteries: React.FC<BatteryProps> = ({
  colorBat1,
  colorBat2,
  colorBat3,
  colorBat4,
  colorBat5,
  colorBat6,
  colorBat7,
  colorBat8,
  isDocked,
  textVolts,
  textAmps,
  textAmpAgo,
  colorVolts,
  colorAmps,
}) => {
  return (
    <g>
      <title>Batteries in 0.5 increment from 13.5 to 16.5</title>
      <circle
        aria-label="bat1"
        className={colorBat1}
        cx="309"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat2"
        className={colorBat2}
        cx="319"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat3"
        className={colorBat3}
        cx="329"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat4"
        className={colorBat4}
        cx="339"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat5"
        className={colorBat5}
        cx="349"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat6"
        className={colorBat6}
        cx="359"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat7"
        className={colorBat7}
        cx="369"
        cy="241.38"
        r="4"
      />
      <circle
        aria-label="bat8"
        className={colorBat8}
        cx="379"
        cy="241.38"
        r="4"
      />
      <rect
        aria-label="amps"
        x="336.28"
        y="261.76"
        className={colorAmps}
        width="25.5"
        height="10.5"
      />
      <rect
        aria-label="volts"
        x="336.28"
        y="249.85"
        className={colorVolts}
        width="25.5"
        height="10.5"
      />
      <text
        aria-label="text_volts"
        transform="matrix(1 0 0 1 338.0 257.9931)"
        className="st9 st10"
      >
        {textVolts}
      </text>
      <text
        aria-label="text_amps"
        transform="matrix(1 0 0 1 338.0 270.4917)"
        className="st9 st10"
      >
        {textAmps}
      </text>
      <text
        aria-label="text_ampago"
        transform="matrix(1 0 0 1 330.0 280.0)"
        className="st12 st9 st13"
      >
        {textAmpAgo}
      </text>
      <text
        transform="matrix(1 0 0 1 308.64 258.2642)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Volts:
      </text>
      <text
        transform="matrix(1 0 0 1 304.7791 270.4165)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        AmpH:
      </text>
    </g>
  )
}
