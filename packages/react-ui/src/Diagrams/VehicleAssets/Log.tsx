import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface LogProps {
  textLogTime: VehicleProps['textLogTime']
  textLogAgo: VehicleProps['textLogAgo']
  isDocked?: boolean
}

export const Log: React.FC<LogProps> = ({
  textLogTime,
  textLogAgo,
  isDocked,
}) => {
  return (
    <g>
      <text
        name="text_logtime"
        transform="matrix(1 0 0 1 185.0 221.6039)"
        className="st9 st10"
      >
        {textLogTime}
      </text>
      <text
        name="text_logago"
        transform="matrix(1 0 0 1 185.0 231.2224)"
        className="st12 st9 st13"
      >
        {textLogAgo}
      </text>
      <text
        transform="matrix(1 0 0 1 144.0 221.6039)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Log start:
      </text>
    </g>
  )
}
