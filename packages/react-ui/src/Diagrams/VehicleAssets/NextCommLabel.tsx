import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface NextCommProps {
  textNextComm: VehicleProps['textNextComm']
  colorNextComm: VehicleProps['colorNextComm']
  textNeedsComms?: VehicleProps['textNeedsComms']
  colorNextCommsText?: VehicleProps['colorNextCommsText']
}

export const NextCommLabel: React.FC<NextCommProps> = ({
  textNextComm,
  colorNextComm,
  textNeedsComms,
  colorNextCommsText,
}) => {
  return (
    <g>
      {textNeedsComms && (
        <text
          aria-label="needs comms"
          transform="matrix(1 0 0 1 143.5 288.0)"
          className="st12 st9 st13"
        >
          {textNeedsComms}
        </text>
      )}
      <circle
        data-testid="next comm indicator"
        className={colorNextComm ?? 'st18'}
        cx="138.5"
        cy="295.5"
        r="2"
      />
      <text
        aria-label="next comm"
        transform="matrix(1 0 0 1 195 298.3899)"
        className={`st9 st10 ${colorNextCommsText ?? ''}`}
      >
        {textNextComm}
      </text>
      <text transform="matrix(1 0 0 1 143.5453 298.3899)" className="st9 st10">
        NextComm:
      </text>
    </g>
  )
}
