import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface TimeoutLabelProps {
  textTimeout: VehicleProps['textTimeout']
  colorMissionAgo: VehicleProps['colorMissionAgo']
}
export const TimeoutLabel: React.FC<TimeoutLabelProps> = ({
  textTimeout,
  colorMissionAgo,
}) => {
  return (
    <g>
      <circle
        data-testid="missionoverdue"
        className={colorMissionAgo}
        cx="138.5"
        cy="306"
        r="2"
      />
      <text
        aria-label="timeout"
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
