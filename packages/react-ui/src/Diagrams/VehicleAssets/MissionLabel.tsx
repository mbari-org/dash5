import React from 'react'
import { VehicleProps } from '../Vehicle'

interface MissionProps {
  textMission: VehicleProps['textMission']
  colorMissionDefault: VehicleProps['colorMissionDefault']
}

export const MissionLabel: React.FC<MissionProps> = ({
  textMission,
  colorMissionDefault,
}) => {
  return (
    <g>
      <circle
        name="missiondefault"
        className={colorMissionDefault}
        cx="415"
        cy="183"
        r="2"
      />
      <text transform="matrix(1 0 0 1 419.0 186)" className="st9 st10">
        MISSION:
      </text>
      <text transform="matrix(1 0 0 1 462.0 186)" className="st9 st10 st12">
        {textMission}
      </text>
    </g>
  )
}
