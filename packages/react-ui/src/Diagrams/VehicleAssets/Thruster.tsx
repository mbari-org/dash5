import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

interface ThrusterProps {
  textSpeed: VehicleProps['textSpeed']
  colorHw: VehicleProps['colorHw']
  colorSw: VehicleProps['colorSw']
  colorThrust: VehicleProps['colorThrust']
  isDocked?: boolean
}

export const Thruster: React.FC<ThrusterProps> = ({
  textSpeed,
  colorHw,
  colorSw,
  colorThrust,
  isDocked,
}) => {
  return (
    <g>
      <circle
        data-testid="thruster indicator"
        className={colorThrust}
        cx="175.51"
        cy="261.61"
        r="8.15"
      />
      <text
        textAnchor="right"
        transform="matrix(1 0 0 1 245 254)"
        className="st9 st10"
      >
        HW
      </text>
      <text
        textAnchor="right"
        transform="matrix(1 0 0 1 245 267)"
        className="st9 st10"
      >
        SW
      </text>
      <text
        textAnchor="right"
        transform="matrix(1 0 0 1 245 280)"
        className="st9 st10"
      >
        OT
      </text>
      <circle aria-label="HW" className={colorHw} cx="267" cy="251" r="4" />
      <circle aria-label="SW" className={colorSw} cx="267" cy="264" r="4" />
      <circle aria-label="OT" className="st3" cx="267" cy="277" r="4" />
      <text
        transform="matrix(1 0 0 1 193.9667 260.552)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Thruster
      </text>
      <text
        aria-label="speed"
        transform="matrix(1 0 0 1 198.0612 270)"
        className="st12 st9 st13"
      >
        {textSpeed}
        <title>Speed estimated from last two GPS fixes</title>
      </text>
      <text
        transform="matrix(1 0 0 1 199 275)"
        className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
      >
        command
      </text>
    </g>
  )
}
