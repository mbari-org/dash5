import React from 'react'
import clsx from 'clsx'
import { VehicleProps } from '../Vehicle'

export interface CtdIndicatorProps {
  colorCtd?: VehicleProps['colorCtd']
  textCtdStatus?: VehicleProps['textCtdStatus']
  isDocked?: boolean
}

export const CtdIndicator: React.FC<CtdIndicatorProps> = ({
  colorCtd,
  textCtdStatus,
  isDocked,
}) => {
  // Server sends "ON " or "OFF"; knob sits right when on, left when off.
  const isOn = textCtdStatus?.trim().toUpperCase() === 'ON'
  const knobCx = isOn ? '547' : '541'

  return (
    <>
      {/* Row 1: filled circle indicator + "CTD" label */}
      <circle
        aria-label="ctd dot"
        className={colorCtd}
        cx="542"
        cy="241"
        r="3.6"
      />
      <text
        transform="matrix(1 0 0 1 549.0 241)"
        dominantBaseline="central"
        className={clsx(isDocked ? 'st18' : 'st9 st10')}
      >
        CTD
      </text>

      {/* Row 2: toggle-switch rectangle + white circle knob + status text */}
      <rect
        aria-label="ctd toggle background"
        x="538"
        y="250"
        className={colorCtd}
        width="18"
        height="11"
      />
      <circle
        aria-label="ctd toggle knob"
        cx={knobCx}
        cy="255.5"
        r="2.8"
        className="st3"
      />
      <text
        aria-label="ctd status"
        transform="matrix(1 0 0 1 558.0 258.0)"
        className={clsx(isDocked ? 'st18' : 'st9')}
        style={{ fontSize: '7.5px' }}
      >
        {textCtdStatus}
      </text>
    </>
  )
}
