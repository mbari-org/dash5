import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface GpsProps {
  textGps: VehicleProps['textGps']
  textGpsAgo: VehicleProps['textGpsAgo']
  colorGps: VehicleProps['colorGps']
  isDocked: boolean
}
export const Gps: React.FC<GpsProps> = ({
  textGps,
  colorGps,
  textGpsAgo,
  isDocked,
}) => {
  return (
    <g>
      <rect
        name="gps"
        x="407.76"
        y="221.71"
        className={colorGps}
        width="26.93"
        height="10.17"
      />
      <text
        transform="matrix(1 0 0 1 439.3514 226.8654)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Last GPS
      </text>
      <text
        name="text_gpsago"
        transform="matrix(1 0 0 1 481 226.5)"
        className="st12 st9 st13"
      >
        {textGpsAgo}
      </text>
      <text
        name="text_gps"
        transform="matrix(1 0 0 1 410.1005 229.6799)"
        className="st9 st10"
      >
        {textGps}
      </text>
    </g>
  )
}
