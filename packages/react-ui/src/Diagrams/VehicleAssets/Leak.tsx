import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface LeakProps {
  textLeak: VehicleProps['textLeak']
  textLeakAgo: VehicleProps['textLeakAgo']
  colorLeak: VehicleProps['colorLeak']
}
export const Leak: React.FC<LeakProps> = ({
  textLeak,
  colorLeak,
  textLeakAgo,
}) => {
  return (
    <>
      <g transform="translate(119.3 -107.2)">
        <path
          className={colorLeak}
          d="M422,396.5v2.2H190.4v-3.1l2.4,0.3c4.8-0.3,7.1-2.8,7.1-2.8l0.1,0.1c0,0,1.4,3.7,6.6,3.6
	c5.1-0.1,8.3-3.8,8.3-3.8s1.4,3.3,7.6,3.1s6.8-2.8,6.8-2.8s1.8,3.3,7.2,3.1c5.5-0.2,7.4-3.2,7.4-3.2s1.8,2.9,6.5,2.6
	c4.8-0.3,7.1-2.8,7.1-2.8s1.4,3.1,5.2,3.1c3.8,0,7.2-2.9,7.2-2.9s1.4,3.7,6.6,3.6c5.1-0.1,8.3-3.8,8.3-3.8s1.4,3.3,7.6,3.1
	s6.8-2.8,6.8-2.8s1.8,3.3,7.2,3.1c5.5-0.2,7.4-3.2,7.4-3.2s1.8,2.9,6.5,2.6c4.8-0.3,7.1-2.8,7.1-2.8l0.1,0.1c0,0,1.4,3.7,6.6,3.6
	c5.1-0.1,8.3-3.8,8.3-3.8s1.4,3.3,7.6,3.1c6.1-0.2,6.8-2.8,6.8-2.8s1.8,3.3,7.2,3.1c5.5-0.2,7.4-3.2,7.4-3.2s1.8,2.9,6.5,2.6
	c4.8-0.3,7.1-2,7.1-2s2.3,3.1,7.4,2.9s8.3-3.8,8.3-3.8s1.4,3.3,7.6,3.1c6.1-0.2,6.8-2.8,6.8-2.8s1.8,3.3,7.3,3.1"
        />
      </g>
      <text transform="matrix(1 0 0 1 420 300.0)" className="st12 st9 st13">
        {textLeak}
        {textLeakAgo}
      </text>
    </>
  )
}
