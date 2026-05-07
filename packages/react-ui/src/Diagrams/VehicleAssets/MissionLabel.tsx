import React from 'react'
import { VehicleProps } from '../Vehicle'

interface MissionProps {
  textMission: VehicleProps['textMission']
  colorMissionDefault: VehicleProps['colorMissionDefault']
  textMissionAgo?: VehicleProps['textMissionAgo']
  colorMissionText?: VehicleProps['colorMissionText']
}

export const MissionLabel: React.FC<MissionProps> = ({
  textMission,
  colorMissionDefault,
  textMissionAgo,
  colorMissionText,
}) => {
  return (
    <g>
      {textMissionAgo && (
        <text
          aria-label="mission ago"
          transform="matrix(1 0 0 1 462.0 178.0)"
          className="st12 st9 st13"
        >
          {textMissionAgo}
        </text>
      )}
      <circle
        data-testid="mission status indicator"
        className={colorMissionDefault}
        cx="415"
        cy="183"
        r="2"
      />
      <text transform="matrix(1 0 0 1 419.0 186)" className="st9 st10">
        MISSION:
      </text>
      <text
        aria-label="mission name"
        transform="matrix(1 0 0 1 462.0 186)"
        className={`st9 st10 ${colorMissionText ?? 'st12'}`}
      >
        {textMission}
      </text>
    </g>
  )
}
