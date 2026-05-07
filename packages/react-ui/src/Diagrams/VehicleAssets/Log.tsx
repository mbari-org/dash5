import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface LogProps {
  textLogTime: VehicleProps['textLogTime']
  textLogAgo: VehicleProps['textLogAgo']
  colorLogAgo?: VehicleProps['colorLogAgo']
  isDocked?: boolean
}

export const Log: React.FC<LogProps> = ({
  textLogTime,
  textLogAgo,
  colorLogAgo,
  isDocked,
}) => {
  return (
    <g>
      <circle
        data-testid="log ago indicator"
        cx="141"
        cy="219.5"
        r="2"
        className={colorLogAgo ?? 'st4'}
      />
      <text
        aria-label="log time"
        transform="matrix(1 0 0 1 185.0 221.6039)"
        className="st9 st10"
      >
        {textLogTime}
      </text>
      <text
        aria-label="time since last log"
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
