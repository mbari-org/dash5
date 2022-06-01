import React from 'react'
import clsx from 'clsx'
import { styles } from '../Vehicle'

export const Cart = () => {
  return (
    <g>
      <polygon
        aria-label="cart"
        className={clsx('stroke-black', styles.fillDarkGray)}
        points="348.8,282.24 348.8,315.73 524.05,315.73 524.05,282.24 503.4,282.24 496.15,301.22 381.17,301.22   369.22,282.74 "
      />
      <circle
        aria-label="circle1"
        fill="#E3CFA7"
        className={'stroke-black'}
        cx="362.59"
        cy="298.44"
        r="5.86"
      />
      <circle
        aria-label="circle2"
        fill="#E3CFA7"
        className={'stroke-black'}
        cx="510.1"
        cy="298.44"
        r="5.86"
      />
    </g>
  )
}
