import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

interface DropWeightProps {
  textDroptime: VehicleProps['textDroptime']
  colorDrop: VehicleProps['colorDrop']
  isDocked: boolean
}
export const DropWeightIndicator: React.FC<DropWeightProps> = ({
  textDroptime,
  colorDrop,
  isDocked,
}) => {
  return (
    <>
      <rect
        x="284.79"
        y="282.44"
        className={colorDrop}
        width="24.43"
        height="9.5"
      />
      <text
        transform="matrix(1 0 0 1 285 300)"
        className={clsx(isDocked ? 'st18' : 'st12 st9 st13')}
      >
        DROP WEIGHT
      </text>
      <text transform="matrix(1 0 0 1 338 300)" className="st12 st9 st13">
        {textDroptime}
      </text>
    </>
  )
}
