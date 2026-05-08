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
      {/* Defaults to st18 (invisible) so older servers that don't send
          color_logago don't produce an orphaned dot. Also hidden when docked. */}
      <circle
        data-testid="log ago indicator"
        cx="141"
        cy="219.5"
        r="2"
        className={isDocked ? 'st18' : colorLogAgo ?? 'st18'}
      />
      <text
        aria-label="log time"
        transform="matrix(1 0 0 1 189.0 221.6039)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        {textLogTime}
      </text>
      <text
        aria-label="time since last log"
        transform="matrix(1 0 0 1 148.0 231.2224)"
        className={clsx(isDocked ? 'st18' : 'st12 st9 st13')}
      >
        {textLogAgo}
      </text>
      <text
        transform="matrix(1 0 0 1 148.0 221.6039)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Log start:
      </text>
    </g>
  )
}
