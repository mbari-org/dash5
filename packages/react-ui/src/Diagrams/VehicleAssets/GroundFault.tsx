import clsx from 'clsx'
import React from 'react'
import { VehicleProps } from '../Vehicle'

interface GroundFaultProps {
  textGf?: VehicleProps['textGf']
  colorGf?: VehicleProps['colorGf']
  textGfTime?: VehicleProps['textGfTime']
  isDocked?: boolean
}

export const GroundFault: React.FC<GroundFaultProps> = ({
  textGf,
  colorGf,
  textGfTime,
  isDocked,
}) => {
  return (
    <>
      <g>
        <title>
          Ground Fault: None means not detected. False means no recent scan
        </title>
        <line className="st7" x1="475.36" y1="256.18" x2="475.36" y2="267.72" />
        <line className="st7" x1="468.58" y1="268.37" x2="482.15" y2="268.37" />
        <line className="st7" x1="469.91" y1="270.59" x2="480.82" y2="270.59" />
        <line className="st7" x1="471.24" y1="272.82" x2="479.49" y2="272.82" />
        <line className="st8" x1="472.57" y1="275.05" x2="478.16" y2="275.05" />
        <rect
          data-testid="ground fault color"
          x="480"
          y="254.0"
          className={colorGf}
          width="24.43"
          height="10.5"
        />
      </g>
      <g>
        <title>
          Ground Fault: None means not detected. False means no recent scan
        </title>
        {/* do not show labels when vehicle is docked */}
        <text
          transform="matrix(1 0 0 1 485 273)"
          className={clsx(isDocked ? 'st18' : 'st12 st9 st13')}
        >
          GROUND
        </text>
        <text
          transform="matrix(1 0 0 1 485 281)"
          className={clsx(isDocked ? 'st18' : 'st12 st9 st13')}
        >
          FAULT
        </text>
        <text transform="matrix(1 0 0 1 482 262.4973)" className="st9 st10">
          {textGf}
        </text>
        <text
          transform="matrix(1 0 0 1 479.3629 250)"
          className="st12 st9 st13"
        >
          {textGfTime}
        </text>
      </g>
    </>
  )
}
