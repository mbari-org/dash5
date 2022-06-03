import React from 'react'
import { VehicleProps } from '../Vehicle'

interface ScheduleLabelProps {
  textScheduled: VehicleProps['textScheduled']
  colorScheduled: VehicleProps['colorScheduled']
}
export const ScheduleLabel: React.FC<ScheduleLabelProps> = ({
  textScheduled,
  colorScheduled,
}) => {
  return (
    <g>
      <circle
        name="scheduleddefault"
        className={colorScheduled}
        cx="415"
        cy="193.5"
        r="1.6"
      />
      <text
        name="missionsched"
        transform="matrix(1 0 0 1 419.5 196)"
        className="st12 st9 st13"
      >
        {textScheduled}
      </text>
    </g>
  )
}
