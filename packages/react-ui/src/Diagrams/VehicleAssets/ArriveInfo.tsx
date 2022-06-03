import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface ArriveInfoProps {
  textArriveStation: VehicleProps['textArriveStation']
  textStationDist: VehicleProps['textStationDist']
  textCurrentDist: VehicleProps['textCurrentDist']
  isDocked?: boolean
}
export const ArriveInfo: React.FC<ArriveInfoProps> = ({
  textArriveStation,
  textCurrentDist,
  textStationDist,
  isDocked,
}) => {
  return (
    <g>
      <text
        name="text_arrivestation"
        transform="matrix(1 0 0 1 581 230)"
        className="st9 st13"
      >
        {textArriveStation}
      </text>
      <text
        name="text_stationdist"
        transform="matrix(1 0 0 1 582 238)"
        className="st12 st9 st24"
      >
        {textStationDist}
      </text>
      <text
        name="text_currentdist"
        transform="matrix(1 0 0 1 582 245)"
        className="st12 st9 st24"
      >
        {textCurrentDist}
      </text>
      <text
        name="arrive_label"
        transform="matrix(1 0 0 1 580 222)"
        className={clsx(isDocked ? 'st18' : 'st12 st9 st24')}
      >
        Arrive Station
      </text>
    </g>
  )
}
