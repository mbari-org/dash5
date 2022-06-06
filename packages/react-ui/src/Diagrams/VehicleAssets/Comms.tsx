import clsx from 'clsx'
import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface CommsProps {
  textSat: VehicleProps['textSat']
  textCell: VehicleProps['textCell']
  textCommAgo: VehicleProps['textCommAgo']
  textCellAgo: VehicleProps['textCellAgo']
  colorSatComm: VehicleProps['colorSatComm']
  colorCell: VehicleProps['colorCell']
  isDocked: boolean
}
export const Comms: React.FC<CommsProps> = ({
  textSat,
  textCell,
  textCommAgo,
  textCellAgo,
  colorSatComm,
  colorCell,
  isDocked,
}) => {
  return (
    <g>
      <rect
        data-testid="satcomm"
        x="261.49"
        y="182.98"
        className={colorSatComm}
        width="24.43"
        height="11.5"
      />
      <rect
        data-testid="cell"
        x="260.15"
        y="212.24"
        className={colorCell}
        width="26.43"
        height="11.31"
      />
      <text
        aria-label="text sat"
        transform="matrix(1 0 0 1 262.2478 192.1254)"
        className="st9 st10"
      >
        {textSat}
      </text>
      <text
        aria-label="text cell"
        transform="matrix(1 0 0 1 262.2472 221.3249)"
        className="st9 st10"
      >
        {textCell}
      </text>
      <text
        transform="matrix(1 0 0 1 289.4541 191.2224)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Sat comms
      </text>
      <text
        transform="matrix(1 0 0 1 291.6499 221.6039)"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        Cell comms
      </text>
      <text
        name="text_commago"
        transform="matrix(1 0 0 1 339.0 191.2224)"
        className="st12 st9 st13"
      >
        {textCommAgo}
      </text>
      <text
        name="text_cellago"
        transform="matrix(1 0 0 1 342.0 221.2224)"
        className="st12 st9 st13"
      >
        {textCellAgo}
      </text>
    </g>
  )
}
