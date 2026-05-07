import React from 'react'
import { VehicleProps } from '../Vehicle'

export interface AuvBodyProps {
  dockBuoy?: VehicleProps['dockBuoy']
  dockEye?: VehicleProps['dockEye']
  dockLine?: VehicleProps['dockLine']
  dockTri?: VehicleProps['dockTri']
}

export const AuvBody: React.FC<AuvBodyProps> = ({
  dockBuoy,
  dockEye,
  dockLine,
  dockTri,
}) => {
  return (
    <g>
      <path
        className="st2"
        d="M554.57,292.12l-279.27,0l0-60.4l279.27,0c16.68,0,30.2,13.52,30.2,30.2v0  C584.77,278.6,571.25,292.12,554.57,292.12z"
      />

      <polygon
        className="st3"
        points="154.9,269.51 275.29,292.12 275.29,231.72 154.9,254.33 "
      />
      <polygon
        className="st3"
        points="255.42,235.44 244.05,237.4 244.8,183.82 255.99,180.82 "
      />
      {/* Docking station indicators — visible only when vehicle is docked */}
      <line
        data-testid="dock line"
        className={dockLine ?? 'st18'}
        x1="275.29"
        y1="231.72"
        x2="275.29"
        y2="210"
      />
      <circle
        data-testid="dock buoy"
        className={dockBuoy ?? 'st18'}
        cx="275.29"
        cy="205"
        r="8"
      />
      <circle
        data-testid="dock eye"
        className={dockEye ?? 'st18'}
        cx="275.29"
        cy="205"
        r="3"
      />
      <polygon
        data-testid="dock tri"
        className={dockTri ?? 'st18'}
        points="268,212 275.29,198 282.58,212"
      />
    </g>
  )
}
