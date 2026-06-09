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
      {/* Docking station — Layer_2 from Dash4, rendered first so the vehicle body
          paints over the submerged mooring line, leaving only the buoy visible */}
      <line
        data-testid="dock line"
        className={dockLine ?? 'st18'}
        x1="538"
        y1="317.5"
        x2="538"
        y2="224.5"
      />
      <circle
        data-testid="dock buoy"
        className={dockBuoy ?? 'st18'}
        cx="538"
        cy="203.7"
        r="13.9"
      />
      <polygon
        data-testid="dock tri"
        className={dockTri ?? 'st18'}
        points="536,225.5 540,225.5 545.6,215.4 530.5,215.4"
      />
      <circle
        data-testid="dock eye"
        className={dockEye ?? 'st18'}
        cx="538"
        cy="220.9"
        r="1.5"
      />

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
    </g>
  )
}
