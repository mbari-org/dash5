import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface TimeoutLabelProps {
  textTimeout: VehicleProps['textTimeout']
}
export const TimeoutLabel: React.FC<TimeoutLabelProps> = ({ textTimeout }) => {
  return (
    <g>
      <circle name="missionoverdue" className="st4" cx="138.5" cy="306" r="2" />
      <text
        name="text_timeout"
        transform="matrix(1 0 0 1 195 309.1899)"
        className="st9 st10"
      >
        {textTimeout}
      </text>
      <text transform="matrix(1 0 0 1 143.0 309.1899)" className="st9 st10">
        Timeout:{' '}
      </text>
    </g>
  )
}
