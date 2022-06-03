import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface ChargingCableProps {
  colorSmallCable: VehicleProps['colorSmallCable']
  colorBigCable: VehicleProps['colorBigCable']
}
export const ChargingCable: React.FC<ChargingCableProps> = ({
  colorBigCable,
  colorSmallCable,
}) => {
  return (
    <g>
      {/* bigcable */}
      <line
        aria-label="bigcable"
        className={colorBigCable}
        x1="250.77"
        y1="292.21"
        x2="268.73"
        y2="281.71"
      />
      {/* cable */}
      <path
        aria-label="smallcable"
        className={colorSmallCable}
        d="M137.01,323.1c0,0,7.44-8.93,20.84-8.93s20.85,8.93,42.05,8.93s29.77-18.98,47.66-28.86"
      />
    </g>
  )
}
