import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface HeadingProps {
  textArrow: VehicleProps['textArrow']
  textThrustTime: VehicleProps['textThrustTime']
  textReckonDistance: VehicleProps['textReckonDistance']
  colorArrow: VehicleProps['colorArrow']
  isDocked?: boolean
}
export const Heading: React.FC<HeadingProps> = ({
  textArrow,
  textThrustTime,
  textReckonDistance,
  colorArrow,
  isDocked,
}) => {
  return (
    <>
      <g
        name="arrow"
        transform={`rotate (-90,604.94,259.74), rotate(${
          textArrow ? textArrow : '90'
        },605,259.74)`}
      >
        <rect
          x="594.14"
          y="256.24"
          className={colorArrow}
          width="11.73"
          height="7"
        />
        <g>
          <polygon
            className={colorArrow}
            points="618.22,259.74 600.81,266.86 604.94,259.74 600.81,252.63       "
          />
        </g>
      </g>
      {textArrow && (
        <text
          name="text_bearing"
          transform="matrix(1 0 0 1 596 262.3)"
          className="st9 st13"
        >
          {`${textArrow}°`}
        </text>
      )}
      <text
        name="text_thrusttime"
        transform="matrix(1 0 0 1 592 276.3205)"
        className="st9 st10"
      >
        {textThrustTime}
      </text>

      <text
        name="reckoned_detail"
        transform="matrix(1 0 0 1 592 294)"
        className="st12 st9 st24"
      >
        {textReckonDistance}
      </text>

      <text
        name="reckoned_label"
        transform="matrix(1 0 0 1 592 287)"
        className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
      >
        reckoned<title>Speed estimated from last two GPS fixes</title>
      </text>
    </>
  )
}
