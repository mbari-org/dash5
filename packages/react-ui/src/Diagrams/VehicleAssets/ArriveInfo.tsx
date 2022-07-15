import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface ArriveInfoProps {
  textArriveLabel: VehicleProps['textArriveLabel']
  textArriveStation: VehicleProps['textArriveStation']
  textStationDist: VehicleProps['textStationDist']
  textCurrentDist: VehicleProps['textCurrentDist']
  isDocked?: boolean
  isFullWidthDiagram?: boolean
}
export const ArriveInfo: React.FC<ArriveInfoProps> = ({
  textArriveLabel,
  textArriveStation,
  textCurrentDist,
  textStationDist,
  isDocked,
  isFullWidthDiagram,
}) => {
  return (
    <g>
      <text
        data-testid="arrive_label"
        transform={
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 171)'
            : 'matrix(1 0 0 1 580 222)'
        }
        className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
      >
        {textArriveLabel}
      </text>
      <text
        data-testid="text_arrivestation"
        transform={
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 180)'
            : 'matrix(1 0 0 1 581 230)'
        }
        className="st9 st13"
      >
        {textArriveStation}
      </text>
      <text
        data-testid="text_stationdist"
        transform={
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 188)'
            : 'matrix(1 0 0 1 582 238)'
        }
        className="st12 st9 st24"
      >
        {textStationDist}
      </text>
      <text
        data-testid="text_currentdist"
        transform={
          isFullWidthDiagram
            ? 'matrix(1 0 0 1 135 195)'
            : 'matrix(1 0 0 1 582 245)'
        }
        className="st12 st9 st24"
      >
        {textCurrentDist}
      </text>
    </g>
  )
}
