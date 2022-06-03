import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface NextCommProps {
  textNextComm: VehicleProps['textNextComm']
  colorNextComm: VehicleProps['colorNextComm']
}

export const NextCommLabel: React.FC<NextCommProps> = ({
  textNextComm,
  colorNextComm,
}) => {
  return (
    <g>
      <circle
        name="commoverdue"
        className={colorNextComm}
        cx="138.5"
        cy="295.5"
        r="2"
      />
      <text
        name="text_nextcomm"
        transform="matrix(1 0 0 1 195 298.3899)"
        className="st9 st10"
      >
        {textNextComm}
      </text>
      <text transform="matrix(1 0 0 1 143.5453 298.3899)" className="st9 st10">
        NextComm:
      </text>
    </g>
  )
}
