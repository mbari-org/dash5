import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface VehicleInfoProps {
  textVehicle: VehicleProps['textVehicle']
  textLastUpdate: VehicleProps['textLastUpdate']
}
export const VehicleInfo: React.FC<VehicleInfoProps> = ({
  textVehicle,
  textLastUpdate,
}) => {
  return (
    <g>
      <text
        name="text_vehicle"
        transform="matrix(1 0 0 1 400 254.7336)"
        className="st14 st15"
      >
        {textVehicle}
      </text>
      <text
        name="text_lastupdate"
        transform="matrix(1 0 0 1 406.0 280.0)"
        className="st14 st15"
      >
        {textLastUpdate}
      </text>
      <text transform="matrix(1 0 0 1 404.0 268.0)" className="st12 st9 st13">
        UPDATED:
      </text>
    </g>
  )
}
