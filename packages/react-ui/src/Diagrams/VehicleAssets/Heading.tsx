import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface HeadingProps {
  textArrow: VehicleProps['textArrow']
  textThrustTime: VehicleProps['textThrustTime']
  textReckonDistance: VehicleProps['textReckonDistance']
  colorArrow: VehicleProps['colorArrow']
  isDocked?: boolean
  isFullWidthDiagram?: boolean
}
export const Heading: React.FC<HeadingProps> = ({
  textArrow,
  textThrustTime,
  textReckonDistance,
  colorArrow,
  isDocked,
  isFullWidthDiagram,
}) => {
  const upArrow = String.fromCharCode(8593)

  return (
    <>
      {!isFullWidthDiagram && (
        <g
          aria-label="arrow"
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
              data-testid="arrow head"
              className={colorArrow}
              points="618.22,259.74 600.81,266.86 604.94,259.74 600.81,252.63"
            />
          </g>
        </g>
      )}
      {textArrow && (
        <text
          aria-label="bearing"
          transform={
            isFullWidthDiagram
              ? 'matrix(1 0 0 1 142 298)'
              : 'matrix(1 0 0 1 596 262.3)'
          }
          className={clsx(isFullWidthDiagram ? 'st24' : 'st9 st13')}
        >
          {`${textArrow}°`}
        </text>
      )}
      <text
        aria-label="thrust time"
        transform={
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 252)'
            : 'matrix(1 0 0 1 592 276.3205)'
        }
        className="st9 st10"
      >
        {textThrustTime}
      </text>

      <text
        data-testid="reckoned_label"
        transform={clsx(
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 260)'
            : 'matrix(1 0 0 1 592 287)'
        )}
        className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
      >
        reckoned<title>Speed estimated from last two GPS fixes</title>
      </text>

      <text
        aria-label="reckoned detail"
        transform={clsx(
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 268.5)'
            : 'matrix(1 0 0 1 592 294)'
        )}
        className="st12 st9 st24"
      >
        {textReckonDistance}
      </text>

      {isFullWidthDiagram && (
        <>
          {' '}
          <text
            data-testid="speed label"
            transform="matrix(1 0 0 1 135 241)"
            className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
          >
            SPEED
          </text>
          <text
            data-testid="heading label"
            transform="matrix(1 0 0 1 135 290)"
            className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
          >
            HEADING
          </text>
          <text
            textAnchor="middle"
            dominantBaseline="central"
            transform={`matrix(1 0 0 1 138 296) rotate(${textArrow})`}
            className={clsx(isDocked ? 'st18' : `st24`)}
          >
            {upArrow}
          </text>{' '}
        </>
      )}
    </>
  )
}
