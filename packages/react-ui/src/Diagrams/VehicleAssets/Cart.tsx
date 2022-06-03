import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface CartProps {
  colorCart: VehicleProps['colorCart']
  colorCartCircle: VehicleProps['colorCartCircle']
}

export const Cart: React.FC<CartProps> = ({ colorCart, colorCartCircle }) => {
  return (
    <g>
      <polygon
        name="cart"
        className={colorCart}
        points="348.8,282.24 348.8,315.73 524.05,315.73 524.05,282.24 503.4,282.24 496.15,301.22 381.17,301.22 369.22,282.74 "
      />
      <circle
        name="circle1"
        className={colorCartCircle}
        cx="362.59"
        cy="298.44"
        r="5.86"
      />
      <circle
        name="circle2"
        className={colorCartCircle}
        cx="510.1"
        cy="298.44"
        r="5.86"
      />
    </g>
  )
}
