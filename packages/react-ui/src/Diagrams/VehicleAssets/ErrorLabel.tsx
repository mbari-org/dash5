import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface ErrorLabelProps {
  textCriticalError: VehicleProps['textCriticalError']
  textCriticalTime: VehicleProps['textCriticalTime']
}

export const ErrorLabel: React.FC<ErrorLabelProps> = ({
  textCriticalError,
  textCriticalTime,
}) => {
  return (
    <g>
      <text
        aria-label="critical error"
        transform="matrix(1 0 0 1 154.0 176)"
        className="st9 st30 st31"
      >
        {textCriticalError}
      </text>
      <text
        aria-label="critical error time"
        transform="matrix(1 0 0 1 156 183)"
        className="st12 st9 st13"
      >
        {textCriticalTime}
      </text>
    </g>
  )
}
